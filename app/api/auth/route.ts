import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'

export async function GET() {
  return new Response('Auth Required.', {
    status: 401,
    headers: {
      'WWW-authenticate': 'Basic realm="Secure Area"'
    }
  })
}