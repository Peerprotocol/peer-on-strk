import { createTransaction } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const tx = await createTransaction(req.body);
    res.status(200).json(tx.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}