import { fetcher } from './api';
import { Folder } from '@/types/model';

export const folderService = {
  async getAllFolders(): Promise<Folder[]> {
    return fetcher('folders');
  },
  
  async createFolder(name: string): Promise<Folder> {
    return fetcher('folders', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  
  async renameFolder(id: string, name: string): Promise<Folder> {
    return fetcher(`folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name })
    });
  },
  
  async deleteFolder(id: string): Promise<void> {
    return fetcher(`folders/${id}`, {
      method: 'DELETE'
    });
  }
};