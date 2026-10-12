// What bookshelf.cv/<username> shows: the owner's public profile (never their email) and shelf.
export function publicShelfView(owner, { books, themeId, purchasedThemeIds }) {
  return {
    owner: { name: owner.name, username: owner.username, picture: owner.picture, since: new Date(owner.created_at).getUTCFullYear() },
    shelf: { books, themeId, purchasedThemeIds },
  };
}
