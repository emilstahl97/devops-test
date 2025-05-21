document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addTodoButton = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');

    // API URL - adjust this to match your backend URL when deployed
    const API_URL = 'http://localhost:30080/api/todos';

    // Fetch all todos when page loads
    fetchTodos();

    // Add event listener for adding new todos
    addTodoButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Function to fetch all todos from API
    function fetchTodos() {
        fetch(API_URL)
            .then((response) => response.json())
            .then((todos) => {
                // Clear the current list
                todoList.innerHTML = '';

                // Add each todo to the list
                for (const todo of todos) {
                    addTodoToDOM(todo);
                }
            })
            .catch((error) => {
                console.error('Error fetching todos:', error);
            });
    }

    // Function to add a new todo
    function addTodo() {
        const task = todoInput.value.trim();
        if (!task) return;

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task }),
        })
            .then((response) => response.json())
            .then((newTodo) => {
                addTodoToDOM(newTodo);
                todoInput.value = '';
            })
            .catch((error) => {
                console.error('Error adding todo:', error);
            });
    }

    // Function to toggle todo completion status
    function toggleTodoCompletion(id, completed) {
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed }),
        }).catch((error) => {
            console.error('Error updating todo:', error);
        });
    }

    // Function to delete a todo
    function deleteTodo(id) {
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                const todoElement = document.getElementById(`todo-${id}`);
                if (todoElement) {
                    todoElement.remove();
                }
            })
            .catch((error) => {
                console.error('Error deleting todo:', error);
            });
    }

    // Function to add a todo to the DOM
    function addTodoToDOM(todo) {
        const li = document.createElement('li');
        li.id = `todo-${todo.id}`;
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            toggleTodoCompletion(todo.id, checkbox.checked);
            li.className = `todo-item ${checkbox.checked ? 'completed' : ''}`;
        });

        const span = document.createElement('span');
        span.textContent = todo.task;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        todoList.appendChild(li);
    }
});
