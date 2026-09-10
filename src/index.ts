import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.resolve(__dirname, '../financeiro.db');
const db = new Database(dbPath);

// Criando a tabela com a coluna 'usuario'
db.prepare(`
  CREATE TABLE IF NOT EXISTS transacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data TEXT NOT NULL
  )
`).run();

// Cadastrar transação com usuário
app.post('/transacoes', (req, res) => {
  try {
    const { usuario, descricao, valor, tipo, categoria, data } = req.body;
    const stmt = db.prepare(`INSERT INTO transacoes (usuario, descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?, ?)`);
    const info = stmt.run(usuario || 'Eduardo', descricao, valor, tipo, categoria, data);
    
    res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Salvo com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});

// Listar transações (filtrando opcionalmente por usuário)
app.get('/transacoes', (req, res) => {
  try {
    const { usuario } = req.query;
    let query = `SELECT * FROM transacoes`;
    let rows;

    if (usuario) {
      query += ` WHERE usuario = ? ORDER BY id DESC`;
      rows = db.prepare(query).all(usuario);
    } else {
      query += ` ORDER BY id DESC`;
      rows = db.prepare(query).all();
    }

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ erro: err.message });
  }
});

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