import type { User } from '../types/user.types';

export function exportUsersToXml(users: User[]): string {
  const items = users
    .map(
      (u) =>
        `  <user id="${u.id}">
    <name>${escapeXml(`${u.firstName} ${u.lastName}`)}</name>
    <email>${escapeXml(u.email)}</email>
    <role>${u.role}</role>
    <status>${u.status}</status>
    <createdAt>${u.createdAt}</createdAt>
  </user>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<users>\n${items}\n</users>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
