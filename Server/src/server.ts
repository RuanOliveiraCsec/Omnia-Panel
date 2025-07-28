import express from 'express';
import { PrismaClient } from '@prisma/client';

// Cria uma instância do Express
const app = express();

// Middleware para aceitar JSON no corpo das requisições
app.use(express.json());

// Cria uma instância do Prisma Client (ORM)
const prisma = new PrismaClient();

// Evita vazamento de conexões: encerra o Prisma ao finalizar o processo
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

/**
 * Rota de registro de usuário
 * POST /register
 * Espera um JSON com: { "email": string, "password": string }
 */
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Verificação simples
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // Cria novo usuário no banco
    const user = await prisma.user.create({
      data: {
        email,
        password, // Em produção, NUNCA salve a senha pura — use bcrypt
      },
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já registrado.' });
    }

    console.error('Erro ao registrar usuário:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
