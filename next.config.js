/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'placehold.co'],
  },
  swcMinify: true,
  // Adiciona a configuração de webpack para resolver o erro de "fs" e "async_hooks"
  // Estes módulos são internos do Node.js e não são necessários no frontend,
  // mas podem ser referenciados por alguma dependência no build do Vercel.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false, // Resolve 'fs' para o lado do cliente
        async_hooks: false, // Resolve 'async_hooks' para o lado do cliente
      };
    }
    return config;
  },
  experimental: {
    // Estas flags experimentais podem ajudar na otimização do Next.js
    // Verifique a documentação oficial do Next.js para compatibilidade com sua versão.
    // client-side external packages:
    // nextJs will consider any imported package to be a server-side only.
    // nextJs transpiles any imports for client side.
    // this will make NextJs bundle the client-side packages.
    serverComponentsExternalPackages: ['@prisma/client', 'resend', '@auth/prisma-adapter'],
  }
};

module.exports = nextConfig;
