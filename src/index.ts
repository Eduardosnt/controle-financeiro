import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

// Conectando ao Banco de Dados SQLite na raiz do projeto
const dbPath = path.resolve(__dirname, '../financeiro.db');
const db = new Database(dbPath);
console.log('Banco de dados conectado com sucesso!');

// Criando a tabela de transações se ela não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data TEXT NOT NULL
  )
`).run();

// Rota para cadastrar um novo gasto ou receita
app.post('/transacoes', (req, res) => {
  try {
    const { descricao, valor, tipo, categoria, data } = req.body;
    const stmt = db.prepare(`INSERT INTO transacoes (descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?)`);
    const info = stmt.run(descricao, valor, tipo, categoria, data);
    
    res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Salvo com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});

// Rota para listar todas as transações
app.get('/transacoes', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM transacoes ORDER BY id DESC`).all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});

// Rota para deletar uma transação
app.delete('/transacoes/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`DELETE FROM transacoes WHERE id = ?`).run(id);
    res.json({ mensagem: 'Deletado com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});