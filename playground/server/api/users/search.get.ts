/**
 * Mock API endpoint for user search.
 * Demonstrates async autocomplete integration with taginput.
 *
 * GET /api/users/search?q=<query>
 */
import { defineEventHandler, getQuery } from 'h3'

interface MockUser {
  id: number
  name: string
  email: string
  avatar: string
}

// Mock user database
const mockUsers: MockUser[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: 'A' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: 'B' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', avatar: 'C' },
  { id: 4, name: 'David Brown', email: 'david@example.com', avatar: 'D' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', avatar: 'E' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', avatar: 'F' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', avatar: 'G' },
  { id: 8, name: 'Henry Moore', email: 'henry@example.com', avatar: 'H' },
  { id: 9, name: 'Ivy Taylor', email: 'ivy@example.com', avatar: 'I' },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', avatar: 'J' },
  { id: 11, name: 'Karen Thomas', email: 'karen@example.com', avatar: 'K' },
  { id: 12, name: 'Leo Martinez', email: 'leo@example.com', avatar: 'L' }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = (query.q as string || '').toLowerCase().trim()

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300))

  // Filter users by name or email
  let results = mockUsers
  if (searchTerm) {
    results = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm)
      || user.email.toLowerCase().includes(searchTerm)
    )
  }

  // Return in taginput-compatible format
  return results.map(user => ({
    value: user.id,
    label: user.name,
    email: user.email,
    avatar: user.avatar
  }))
})
