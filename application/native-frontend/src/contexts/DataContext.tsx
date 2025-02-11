import { createContext, useState, useContext, useEffect } from 'react';
import { Store } from '@/store';
import { Api } from '@/api';
import { ClothingDb } from '../models';

interface ClothingContextType {
  clothing: ClothingDb[];
  addClothing: (newClothing: ClothingDb) => Promise<boolean>;
  removeClothing: (clothingId: string) => Promise<boolean>;
}

const ClothingContext = createContext<Resource<ClothingContextType> | null>(
  null
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const store = new Store();
  const api = new Api();

  console.log('RENDERING DATA PROVIDER');

  const [clothing, setClothing] = useState<ClothingDb[]>([]);

  async function addClothing(newClothing: ClothingDb): Promise<boolean> {
    setClothing([...clothing, newClothing]);
    await store.writeClothing(newClothing);
    return !!clothing;
  }

  async function removeClothing(clothingId: string): Promise<boolean> {
    setClothing(clothing.filter((clothing) => clothing.id !== clothingId));
    await store.removeClothing(clothingId);
    return !!clothing;
  }

  const clothingResource = new Resource(async () => {
    console.log('CREATING CLOTHING RESOURCE');

    return {
      clothing,
      addClothing,
      removeClothing,
    };
  });

  useEffect(() => {
    return () => {
      store.destroy();
    };
  }, []);

  return (
    <ClothingContext.Provider value={clothingResource}>
      {children}
    </ClothingContext.Provider>
  );
}

export function useClothing(): ClothingContextType {
  const resource = useContext(ClothingContext)!;
  return resource.read();
}

class Resource<T> {
  private init: () => Promise<T>;
  private result: T | undefined;
  private error: Error | undefined;
  private status: 'pending' | 'success' | 'error' = 'pending';

  constructor(init: () => Promise<T>) {
    this.init = init;
  }

  read(): T {
    switch (this.status) {
      case 'pending':
        const promise = this.init();
        promise.then(
          (result) => {
            this.status = 'success';
            this.result = result;
          },
          (error) => {
            this.status = 'error';
            this.error = error;
          }
        );
        throw promise;
      case 'error':
        throw this.error;
      case 'success':
        return this.result!;
    }
  }
}
