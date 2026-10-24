import { ProductForm } from '../ProductForm';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductForm key={id} id={Number(id)} />;
}
