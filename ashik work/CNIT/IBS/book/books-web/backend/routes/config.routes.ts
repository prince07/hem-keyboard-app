import { Router } from 'express';
import { databaseManager } from '../database/manager';

const router = Router();

// Get company info
router.get('/company', async (req, res) => {
  try {
    const companyInfo = await databaseManager.getCompanyInfo();
    res.json(companyInfo);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to get company info' });
  }
});

// Create company
router.post('/company', async (req, res) => {
  try {
    const {
      name,
      country,
      currency,
      email,
      fiscal_year_start,
      fiscal_year_end
    } = req.body;

    await databaseManager.createCompany({
      name,
      country,
      currency,
      email,
      fiscal_year_start,
      fiscal_year_end
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to create company' });
  }
});

// Get application settings
router.get('/settings', async (req, res) => {
  try {
    // TODO: Implement settings retrieval
    res.json({
      language: 'English',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light'
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to get settings' });
  }
});

// Update application settings
router.put('/settings', async (req, res) => {
  try {
    const { language, dateFormat, theme } = req.body;
    // TODO: Implement settings update
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to update settings' });
  }
});

export default router;
