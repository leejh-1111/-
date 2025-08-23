// Todo 앱 기능 구현 (Bootstrap, Tailwind, FontAwesome UI 적용)
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item list-group-item border-0 flex items-center justify-between gap-2';
    li.style.animation = 'fadeIn 0.4s';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-3';

    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-sm rounded-full flex items-center justify-center ' + (todo.completed ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-indigo-100');
    checkBtn.innerHTML = todo.completed ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-regular fa-circle"></i>';
    checkBtn.onclick = () => toggleComplete(idx);

    const span = document.createElement('span');
    span.className = 'todo-text' + (todo.completed ? ' completed' : '') + ' text-lg';
    span.textContent = todo.text;

    left.appendChild(checkBtn);
    left.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'todo-actions flex items-center';

    const delBtn = document.createElement('button');
    delBtn.className = 'ml-2 btn btn-danger flex items-center gap-1 px-2 py-1 text-base';
    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i> 삭제';
    delBtn.onclick = () => deleteTodo(idx);
    actions.appendChild(delBtn);
    li.appendChild(left);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  todos.push({ text, completed: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

function deleteTodo(idx) {
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
}

function toggleComplete(idx) {
  todos[idx].completed = !todos[idx].completed;
  saveTodos();
  renderTodos();
}

addTodoBtn.onclick = addTodo;
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// 초기 렌더링
renderTodos();
