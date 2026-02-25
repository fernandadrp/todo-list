// Seleção de elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterBtn = document.querySelector("#filter-select");

let oldInputValue;

//Funções
const saveTodo = (text, done = 0, save = 1) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  todo.appendChild(deleteBtn);

  //Utilizando dados da localStorage
  if (done) {
    todo.classList.add("done");
  }

  if (save) {
    saveTodoLocalStorage({ text, done: 0 });
  }

  todoList.appendChild(todo);

  todoInput.value = "";
  todoInput.focus();
};

const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

const updateToDo = (text) => {
  // Atualiza o texto de uma tarefa
  const todos = document.querySelectorAll(".todo"); // Seleciona todas as tarefas com a classe .todo

  todos.forEach((todo) => {
    // Percorre cada tarefa
    let todoTitle = todo.querySelector("h3"); // Seleciona o título da tarefa (elemento h3)

    if (todoTitle && todoTitle.innerText === oldInputValue) {
      // Se o título atual for igual ao valor antigo
      todoTitle.innerText = text; // Atualiza o título com o novo texto

      updateTodoLocalStorage(oldInputValue, text);
    }
  });
};

const getSearchTodos = (search) => {
  // Filtra tarefas com base no texto digitado na busca
  const todos = document.querySelectorAll(".todo"); // Seleciona todas as tarefas

  todos.forEach((todo) => {
    const h3 = todo.querySelector("h3"); //Dentro de cada tarefa (.todo), ele tenta encontrar um elemento <h3>,
    // que é onde o título da tarefa está armazenado.
    if (!h3) return; // Se não tiver título, pula para a próxima

    const todoTitle = h3.innerText.toLowerCase(); // Converte o título para minúsculo
    const normalizedSearch = search.toLowerCase(); // Converte a busca para minúsculo

    todo.style.display = todoTitle.includes(normalizedSearch) ? "flex" : "none";
    //Se o título da tarefa contém o texto digitado (includes(normalizedSearch)),
    // a tarefa continua visível com display: flex.
    //Caso contrário, ela é escondida com display: none.
  });
};

const filterTodos = (filterValue) => {
  // Filtra tarefas por status (todas, feitas, a fazer)
  const todos = document.querySelectorAll(".todo"); // Seleciona todas as tarefas

  switch (filterValue) {
    case "all": // Mostrar todas as tarefas
      todos.forEach((todo) => (todo.style.display = "flex"));
      break;

    case "done":
      todos.forEach((todo) =>
        todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    case "todo":
      todos.forEach((todo) =>
        !todo.classList.contains("done")
          ? (todo.style.display = "flex")
          : (todo.style.display = "none")
      );
      break;

    default:
      break;
  }
};

//Eventos
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = todoInput.value; // Pega o valor digitado

  if (inputValue) {
    // Se tiver algo digitado
    saveTodo(inputValue); // Salva a nova tarefa
  }
});

document.addEventListener("click", (e) => {
  // Evento geral de clique na página
  const targetEl = e.target; //identifica qual local esta sendo clicado
  const parentEl = targetEl.closest("div"); //identifica a classe pai
  //neste caso é "todo done"

  let todoTitle;

  if (parentEl && parentEl.querySelector("h3")) {
    // Se a tarefa tiver um título
    todoTitle = parentEl.querySelector("h3").innerText; // Pega o texto do título
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done"); // Alterna a classe done (feito/não feito)
    updateTodosStatusLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove(); // Remove a tarefa

    removeTodoLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("edit-todo")) {
    toggleForms(); // Alterna os formulários (mostra o de edição)

    editInput.value = todoTitle; // Preenche o campo de edição com o texto atual
    oldInputValue = todoTitle; // Armazena o valor antigo para saber qual tarefa editar
  }
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms(); // Alterna os formulários de volta
  editInput.value = ""; // Limpa o campo de edição
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const editInputValue = editInput.value; // Pega o valor editado

  if (editInputValue) {
    updateToDo(editInputValue);
  }
  toggleForms();
});

searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value; // Pega o texto digitado

  getSearchTodos(search); // Filtra as tarefas com base nesse texto
});

eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();

  searchInput.value = ""; // Limpa o campo de busca

  searchInput.dispatchEvent(new Event("keyup")); // Dispara o evento de digitação para atualizar os resultados
});

filterBtn.addEventListener("change", (e) => {
  // Ao mudar o filtro (todas, feitas, a fazer)
  const filterValue = e.target.value; // Pega o valor do filtro selecionado
  filterTodos(filterValue); // Aplica o filtro
});

//Local Storage

const getTodoLocalStorage = () => {
  //can you explain what Json.parse() does?
  const todos = JSON.parse(localStorage.getItem("todos")) || [];

  return todos;
};

const loadTodos = () => {
  const todos = getTodoLocalStorage();

  todos.forEach((todo) => {
    saveTodo(todo.text, todo.done, 0);
  });
};

const saveTodoLocalStorage = (todo) => {
  //todos os todos da ls
  const todos = getTodoLocalStorage();

  //add novo todo no arr
  todos.push(todo);

  //can you explain what Json.stringify() does?

  localStorage.setItem("todos", JSON.stringify(todos));
};

const removeTodoLocalStorage = (todoText) => {
  const todos = getTodoLocalStorage();

  const filteredTodos = todos.filter((todo) => todo.text !== todoText);

  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

const updateTodosStatusLocalStorage = (todoText) => {
  const todos = getTodoLocalStorage();

  todos.map((todo) =>
    todo.text === todoText ? (todo.done = !todo.done) : null
  ); //map altera os dados originais

  localStorage.setItem("todos", JSON.stringify(todos));
};

const updateTodoLocalStorage = (todoOldText, todoNewText) => {
  const todos = getTodoLocalStorage();

  todos.map((todo) =>
    todo.text === todoOldText ? (todo.text = todoNewText) : null
  ); //map altera os dados originais

  localStorage.setItem("todos", JSON.stringify(todos));
};

loadTodos();
