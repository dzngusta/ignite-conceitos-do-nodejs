const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find((user) => user.username === username);

	if(!user) {
		return response.status(404).json({ error: 'Usuário não existe.' });
	}

	request.user = user;

	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const userExists = users.some((user) => user.username === username);
	
	if(userExists) {
		return response.status(400).json({ error: `O nome de usuário ${username} não está disponível.` })
	}

	const newUser = {
		id: uuidv4(),
		name,
		username,
		todos: []
	}

	users.push(newUser);

	return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

	return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

	const newTodo = {
		id: uuidv4(),
		title: title,
		done: false, 
		deadline: new Date(deadline), 
		created_at: new Date
	}

	user.todos.push(newTodo);

	return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
	const { title, deadline } = request.body;
	const { user } = request;
	const { todos } = user;

	const findTodo = todos.find((todo) => todo.id === id);

	if(!findTodo){
		return response.status(404).json({ error: `Não há nenhuma tarefa com esse ID.` })
	}

	findTodo.title = title;
	findTodo.deadline = deadline;

	return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { user } = request;
	const { todos } = user;

	const findTodo = todos.find((todo) => todo.id === id);

	if(!findTodo){
		return response.status(404).json({ error: `Não há nenhuma tarefa com esse ID.` })
	}

	findTodo.done = true;

	return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { user } = request;
	const { todos } = user;

	const findTodo = todos.findIndex((todo) => todo.id === id);

	if(findTodo === -1){
		return response.status(404).json({ error: `Não há nenhuma tarefa com esse ID.` })
	}

	todos.splice(findTodo, 1);

	return response.status(204).json();
});

module.exports = app;