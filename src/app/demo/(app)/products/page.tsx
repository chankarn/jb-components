import { Suspense } from 'react';
import { ProductList } from './ProductList';

export default function Page() {
  return (
    <Suspense>
      <ProductList />
    </Suspense>
  );
}
