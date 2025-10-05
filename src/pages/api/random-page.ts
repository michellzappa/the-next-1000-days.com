import type { NextApiRequest, NextApiResponse } from 'next';
import { getRandomPage } from '../../utils/content';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const randomPage = await getRandomPage();
    
    if (!randomPage) {
      return res.status(404).json({ error: 'No pages found' });
    }

    res.status(200).json(randomPage);
  } catch (error) {
    console.error('Error fetching random page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
