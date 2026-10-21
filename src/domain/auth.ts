export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface CharacterFolder {
  id: string;
  name: string;
  userId: string;
}

export interface StoredCharacter {
  id: string;
  userId: string;
  folderId: string | null;
  createdAt: string;
  data: import("./character").Character;
}
