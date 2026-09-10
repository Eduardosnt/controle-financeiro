import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

// Conectando ao Banco de Dados SQLite na raiz do projeto
const dbPath = path.resolve(__dirname, '../financeiro.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite', err);
  } else {
    console.log('Banco de dados conectado com sucesso!');
  }
});

// Criando a tabela de transações se ela não existir
db.run(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL, -- 'gasto' ou 'receita'
    categoria TEXT NOT NULL,
    data TEXT NOT NULL
  )
`);

// Rota para cadastrar um novo gasto ou receita
app.post('/transacoes', (req, res) => {
  const { descricao, valor, tipo, categoria, data } = req.body;
  
  const query = `INSERT INTO transacoes (descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [descricao, valor, tipo, categoria, data], function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.status(201).json({ id: this.lastID, mensagem: 'Salvo com sucesso!' });
  });
});

// Rota para listar todas as transações
app.get('/transacoes', (req, res) => {
  db.all(`SELECT * FROM transacoes ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

// Rota para deletar uma transação (caso erre algo)
app.delete('/transacoes/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM transacoes WHERE id = ?`, id, function(err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json({ mensagem: 'Deletado com sucesso!' });
  });
});

const PORT = process.env.PORT || 3333;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});