import { NextApiRequest, NextApiResponse } from 'next';
import { getNavigationContext } from '../../utils/navigation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chapterId, pageId } = req.query;

  if (!chapterId || typeof chapterId !== 'string') {
    return res.status(400).json({ error: 'chapterId is required' });
  }

  try {
    const context = await getNavigationContext(
      chapterId,
      typeof pageId === 'string' ? pageId : undefined
    );
    res.status(200).json(context);
  } catch (error) {
    console.error('Navigation API error:', error);
    res.status(500).json({ error: 'Failed to get navigation context' });
  }
}
