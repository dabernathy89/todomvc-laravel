
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');
require('todomvc-common');

window.Vue = require('vue');

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

var todoStorage = {
    fetch: function () {
        axios.get('/tasks')
          .then(function (response) {
            app.todos = response.data;
          })
          .catch(function (error) {
            console.log(error);
          });
    },
    add: function (todo) {
        axios.post('/tasks', todo)
          .then(function (response) {
            app.todos.push(response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
    },
    update: function (todo) {
        axios.put('/tasks/' + todo.id, todo)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    },
    delete: function (todo) {
        axios.delete('/tasks/' + todo.id)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    },
};

var filters = {
    all: function (todos) {
        return todos;
    },
    active: function (todos) {
        return todos.filter(function (todo) {
            return !todo.completed;
        });
    },
    completed: function (todos) {
        return todos.filter(function (todo) {
            return todo.completed;
        });
    }
};

var app = new Vue({

    // the root element that will be compiled
    el: '.todoapp',

    // app initial state
    data: {
        todos: [],
        newTodo: '',
        editedTodo: null,
        visibility: 'all'
    },

    // computed properties
    // http://vuejs.org/guide/computed.html
    computed: {
        filteredTodos: function () {
            return filters[this.visibility](this.todos);
        },
        remaining: function () {
            return filters.active(this.todos).length;
        },
        allDone: {
            get: function () {
                return this.remaining === 0;
            },
            set: function (value) {
                this.todos.forEach(function (todo) {
                    todo.completed = value;
                });
            }
        }
    },

    // methods that implement data logic.
    // note there's no DOM manipulation here at all.
    methods: {

        pluralize: function (word, count) {
            return word + (count === 1 ? '' : 's');
        },

        addTodo: function () {
            var value = this.newTodo && this.newTodo.trim();
            if (!value) {
                return;
            }
            this.newTodo = '';
            todoStorage.add({ title: value, completed: false });
        },

        removeTodo: function (todo) {
            var index = this.todos.indexOf(todo);
            this.todos.splice(index, 1);
            todoStorage.delete(todo);
        },

        editTodo: function (todo) {
            this.beforeEditCache = todo.title;
            this.editedTodo = todo;
        },

        doneEdit: function (todo) {
            if (!this.editedTodo) {
                return;
            }
            this.editedTodo = null;
            todo.title = todo.title.trim();
            if (!todo.title) {
                this.removeTodo(todo);
            } else {
                todoStorage.update(todo);
            }
        },

        cancelEdit: function (todo) {
            this.editedTodo = null;
            todo.title = this.beforeEditCache;
        },

        removeCompleted: function () {
            this.todos = filters.active(this.todos);
        },

        updateTodo: function (todo) {
            todoStorage.update(todo);
        }
    },

    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
        'todo-focus': function (el, binding) {
            if (binding.value) {
                el.focus();
            }
        }
    },

    mounted() {
        todoStorage.fetch();
    }
});

import { Router } from 'director/build/director';
var router = new Router();
['all', 'active', 'completed'].forEach(function (visibility) {
    router.on(visibility, function () {
        app.visibility = visibility;
    });
});

router.configure({
    notfound: function () {
        window.location.hash = '';
        app.visibility = 'all';
    }
});

router.init();