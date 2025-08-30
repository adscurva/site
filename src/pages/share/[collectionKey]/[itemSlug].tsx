// src/pages/share/[collectionKey]/[itemSlug].tsx

import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ColecaoProps, ColecaoItem } from 'types';
import { FaWhatsapp, FaHome } from 'react-icons/fa';

interface ShareProps {
  product: ColecaoItem;
  collectionTitle: string;
  shareUrl: string;
}

export const getServerSideProps: GetServerSideProps<ShareProps> = async (
  context: GetServerSidePropsContext
) => {
  const { collectionKey, itemSlug } = context.params as {
    collectionKey: string;
    itemSlug: string;
  };

  // CORRIGIDO: Usando a variável de ambiente diretamente, sem adicionar o protocolo
  const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/crud/colecoes`
    : 'http://localhost:3000/api/crud/colecoes';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch collections: Status ${res.status}`);
    }
    const data = await res.json();
    const collections: ColecaoProps[] = data.colecoes;
    const currentCollection = collections.find((c) => c.slug === collectionKey);
    if (!currentCollection) {
      return {
        notFound: true,
      };
    }
    const product = currentCollection.items.find(item => item.slug === itemSlug);
    if (!product) {
      return {
        notFound: true,
      };
    }
    const host = context.req.headers.host;
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const shareUrl = `${protocol}://${host}/share/${collectionKey}/${itemSlug}`;
    return {
      props: {
        product,
        collectionTitle: currentCollection.title,
        shareUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching data for share page:', error);
    return {
      notFound: true,
    };
  }
};

const SharePage = ({ product, collectionTitle, shareUrl }: ShareProps) => {
  if (!product) {
    return <div>Produto não encontrado.</div>;
  }
  const handleWhatsappClick = () => {
    const whatsappMessage = `Olá! Gostaria de reservar o modelo ${product.productModel}. Link para a foto: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/5591985810208?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(whatsappUrl, '_blank');
  };
  return (
    <div className="bg-primary min-h-screen flex items-center justify-center p-4">
      <Head>
        <title>{`Vestido ${product.productModel || ''} - ${collectionTitle}`}</title>
        <meta
          name="description"
          content={`Confira este lindo vestido da coleção ${collectionTitle}. Modelo ${product.productModel || ''
            }.`}
        />
        <meta property="og:title" content={`Vestido ${product.productModel || ''} - ${collectionTitle}`} />
        <meta
          property="og:description"
          content={`Confira este lindo vestido da coleção ${collectionTitle}.`}
        />
        <meta property="og:image" content={product.img} />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Vestido ${product.productModel || ''} - ${collectionTitle}`} />
        <meta name="twitter:image" content={product.img} />
      </Head>
      <div className="w-full max-w-xl bg-primary rounded-lg shadow-lg overflow-hidden md:max-w-xl">
        <div className="p-4 bg-primary text-center">
          <h1 className="text-xl font-bold">Tecido: {product.productMark}</h1>
          <p className="text-sm text-gray-600">Modelo: {product.productModel}</p>
        </div>
        <div className="relative w-full h-auto">
          <img
            src={product.img}
            alt={`${product.productMark} - ${product.productModel}`}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="p-4 flex flex-col items-center">
          <p className="text-center text-sm text-gray-700 mb-4">{product.description}</p>
          <div className="flex space-x-4">
            <button
              onClick={handleWhatsappClick}
              className="flex items-center space-x-2 bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
            >
              <FaWhatsapp className='text-white' />
              <span>Reservar</span>
            </button>
            <a
              href="/"
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
            >
              <FaHome className='text-white' />
              <span>Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;