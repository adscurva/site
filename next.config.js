/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // swcMinify: true, // Remova esta linha
  // Use a nova configuração de minificação:
  // minify: 'swc', 
  // Adiciona a configuração de webpack para resolver o erro de "fs" e "async_hooks"
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        async_hooks: false,
      };
    }
    return config;
  },
  experimental: {
    // Estas flags experimentais podem ajudar na otimização do Next.js
    // Verifique a documentação oficial do Next.js para compatibilidade com sua versão.
    // serverComponentsExternalPackages foi renomeado para serverExternalPackages:
    // serverExternalPackages: ['@prisma/client', 'resend', '@auth/prisma-adapter'],
  }
};

module.exports = nextConfig;
