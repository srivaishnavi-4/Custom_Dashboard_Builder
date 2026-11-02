
import order from '../models/order.js';

// --------------------------------------------------
// 1. GLOBAL DATE FILTER
// --------------------------------------------------

const get_date_filter = (timeFilter) => {
  const normalized = String(timeFilter || 'All time')
    .trim()
    .toLowerCase();

  const now = new Date();
  let startDate = null;

  switch (normalized) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last 7 days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last 30 days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'last 3 months':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;

    case 'last 90 days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'this year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    case 'all time':
    default:
      return {};
  }

  // Use $toDate to support Date values and
  // date values stored as convertible strings.
  return {
    $expr: {
      $and: [
        {
          $gte: [
            { $toDate: '$createdAt' },
            startDate
          ]
        },
        {
          $lte: [
            { $toDate: '$createdAt' },
            now
          ]
        }
      ]
    }
  };
};


// --------------------------------------------------
// 2. AGGREGATION LOGIC
// --------------------------------------------------

const get_accumulator = (aggregation, field) => {
  switch (aggregation) {
    case 'average':
      return {
        $avg: {
          $cond: [
            { $isNumber: `$${field}` },
            `$${field}`,
            null
          ]
        }
      };

    case 'count':
      return {
        $sum: 1
      };

    case 'sum':
    default:
      return {
        $sum: {
          $cond: [
            { $isNumber: `$${field}` },
            `$${field}`,
            0
          ]
        }
      };
  }
};


// --------------------------------------------------
// 3. DATE GROUPING FOR CHARTS
// --------------------------------------------------

const get_date_group = (timeFilter) => {
  const normalized = String(timeFilter || 'All time')
    .trim()
    .toLowerCase();

  // Daily grouping for shorter date ranges.
  if (
    normalized === 'today' ||
    normalized === 'last 7 days' ||
    normalized === 'last 30 days' ||
    normalized === 'last 90 days'
  ) {
    return {
      $dateToString: {
        format: '%Y-%m-%d',
        date: { $toDate: '$createdAt' }
      }
    };
  }

  // Monthly grouping for longer date ranges.
  return {
    $dateToString: {
      format: '%Y-%m',
      date: { $toDate: '$createdAt' }
    }
  };
};


// --------------------------------------------------
// 4. DASHBOARD METRICS CONTROLLER
// --------------------------------------------------

export const get_dashboard_metrics = async (req, res) => {
  try {

    // ----------------------------------------------
    // GET QUERY PARAMETERS
    // ----------------------------------------------

    const metric = req.query.metric || 'total_amount';

    const aggregation = String(
      req.query.aggregation || 'sum'
    ).toLowerCase();

    const timeFilter = req.query.time || 'All time';

    const xAxis = req.query.x_axis || 'createdAt';

    const yAxis = req.query.y_axis || 'total_amount';

    const pieField = req.query.chart_data || 'status';


    // ----------------------------------------------
    // VALIDATE DYNAMIC FIELD NAMES
    // ----------------------------------------------

    const validField = (field) =>
      typeof field === 'string' &&
      /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(field);

    if (
      ![metric, xAxis, yAxis, pieField].every(validField)
    ) {
      return res.status(400).json({
        error: 'Invalid chart field'
      });
    }


    // ----------------------------------------------
    // APPLY GLOBAL DATE FILTER
    // ----------------------------------------------

    const dateMatch = get_date_filter(timeFilter);


    // ----------------------------------------------
    // KPI AGGREGATION
    // ----------------------------------------------

    const kpiAccumulator = get_accumulator(
      aggregation,
      metric
    );


    // ----------------------------------------------
    // CHART AGGREGATION
    // ----------------------------------------------

    const chartAccumulator = get_accumulator(
      aggregation,
      yAxis
    );

    const xAxisGroup =
      xAxis === 'createdAt'
        ? get_date_group(timeFilter)
        : `$${xAxis}`;


    // ----------------------------------------------
    // EXECUTE ALL QUERIES IN PARALLEL
    // SAME GLOBAL FILTER FOR EVERY QUERY
    // ----------------------------------------------

    const [
      tableData,
      kpiResult,
      pieResult,
      barResult,
      scatterResult
    ] = await Promise.all([

      // --------------------------------------------
      // TABLE DATA
      // Latest 10 records within the global date range
      // --------------------------------------------

      order.find(dateMatch)
        .sort({ createdAt: -1 })
      
        .lean(),


      // --------------------------------------------
      // KPI DATA
      // --------------------------------------------

      order.aggregate([
        {
          $match: dateMatch
        },
        {
          $group: {
            _id: null,

            metricValue: kpiAccumulator,

            totalOrders: {
              $sum: 1
            }
          }
        }
      ]),


      // --------------------------------------------
      // PIE CHART DATA
      // --------------------------------------------

      order.aggregate([
        {
          $match: dateMatch
        },
        {
          $group: {
            _id: `$${pieField}`,

            value: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            value: -1
          }
        }
      ]),


      // --------------------------------------------
      // BAR / LINE / AREA CHART DATA
      // --------------------------------------------

      order.aggregate([
        {
          $match: dateMatch
        },
        {
          $group: {
            _id: xAxisGroup,

            value: chartAccumulator
          }
        },
        {
          $sort: {
            _id: 1
          }
        }
      ]),


      // --------------------------------------------
      // SCATTER CHART DATA
      // --------------------------------------------

      order.aggregate([
        {
          $match: dateMatch
        },
        {
          $project: {
            _id: 0,

            x: xAxis === 'createdAt'
              ? {
                  $toLong: {
                    $toDate: '$createdAt'
                  }
                }
              : {
                  $convert: {
                    input: `$${xAxis}`,
                    to: 'double',
                    onError: null,
                    onNull: null
                  }
                },

            y: {
              $convert: {
                input: `$${yAxis}`,
                to: 'double',
                onError: null,
                onNull: null
              }
            }
          }
        },
        {
          $match: {
            x: { $ne: null },
            y: { $ne: null }
          }
        }
      ])

    ]);


    // ----------------------------------------------
    // FORMAT CHART LABELS
    // ----------------------------------------------

    const formatChartLabel = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return 'Unknown';
      }

      return String(value);
    };


    // ----------------------------------------------
    // KPI RESULT
    // ----------------------------------------------

    const metricValue =
      kpiResult[0]?.metricValue || 0;

    const totalOrders =
      kpiResult[0]?.totalOrders || 0;


    // ----------------------------------------------
    // SEND DASHBOARD RESPONSE
    // ----------------------------------------------

    res.json({

      // Selected global filter
      appliedTimeFilter: timeFilter,


      // KPI
      kpi: {
        totalSales: metricValue,
        metricValue: metricValue,
        totalOrders: totalOrders
      },


      // Table
      table: tableData,


      // Pie chart
      pieChart: {
        labels: pieResult.map(item =>
          formatChartLabel(item._id)
        ),

        values: pieResult.map(item =>
          item.value
        )
      },


      // Bar / Line / Area charts
      barChart: {
        labels: barResult.map(item =>
          formatChartLabel(item._id)
        ),

        values: barResult.map(item =>
          Number(item.value || 0)
        )
      },


      // Scatter chart
      scatterChart: {
        data: scatterResult.map(item => ({
          x: Number(item.x),
          y: Number(item.y)
        }))
      }

    });

  } catch (error) {

    console.error(
      'Dashboard Metrics Error:',
      error
    );

    res.status(500).json({
      error: 'Failed to fetch chart data'
    });

  }
};
