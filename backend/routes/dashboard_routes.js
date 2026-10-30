import express from 'express';
import dashboard_model from '../models/dashboard.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let dashboards = await dashboard_model.find().sort({ createdAt: -1 });
    res.json(dashboards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load dashboards' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { id, name, widgets } = req.body;
    
    let dashboard_data;

    if (id) {
      dashboard_data = await dashboard_model.findById(id);
      if (dashboard_data) {
        dashboard_data.name = name || dashboard_data.name;
        dashboard_data.widgets = widgets;
        await dashboard_data.save();
      } else {
         return res.status(404).json({ error: 'Dashboard not found' });
      }
    } else {
      dashboard_data = new dashboard_model({ 
        name: name || 'My New Dashboard', 
        widgets 
      });
      await dashboard_data.save();
    }
    
    res.json({ message: 'Dashboard saved successfully!', dashboard: dashboard_data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save dashboard' });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    await dashboard_model.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete dashboard' });
  }
});

export default router;