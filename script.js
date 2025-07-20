// Task management functionality
let tasks = [];

// Load tasks from localStorage on startup
window.onload = function() {
    loadTasks();
    updateStats();
    checkEmptyState();
};

// Add new task
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task!', 'error');
        return;
    }
    
    if (taskText.length > 100) {
        showNotification('Task too long! Max 100 characters.', 'error');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    renderTask(task);
    saveTasks();
    updateStats();
    checkEmptyState();
    
    input.value = '';
    input.focus();
    
    showNotification('Task added successfully!', 'success');
}

// Render single task
function renderTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;
    
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            onchange="toggleTask(${task.id})"
            aria-label="Mark task as complete"
        >
        <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})" aria-label="Delete task">
            Delete
        </button>
    `;
    
    taskList.appendChild(li);
}

// Toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateStats();
        
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const textElement = taskElement.querySelector('.task-text');
        const checkbox = taskElement.querySelector('.task-checkbox');
        
        if (task.completed) {
            textElement.classList.add('completed');
            checkbox.checked = true;
        } else {
            textElement.classList.remove('completed');
            checkbox.checked = false;
        }
    }
}

// Delete task
function deleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    // Add fade out animation
    taskElement.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== taskId);
        taskElement.remove();
        saveTasks();
        updateStats();
        checkEmptyState();
        showNotification('Task deleted!', 'info');
    }, 300);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('easydo-tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('easydo-tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => renderTask(task));
    }
}

// Update statistics
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    document.getElementById('totalTasks').textContent = 
        `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
    document.getElementById('completedTasks').textContent = 
        `${completedTasks} completed`;
}

// Check empty state
function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        taskList.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        taskList.style.display = 'block';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        zIndex: '1000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '300px'
    });
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#48bb78';
            break;
        case 'error':
            notification.style.backgroundColor = '#e53e3e';
            break;
        case 'info':
            notification.style.backgroundColor = '#4299e1';
            break;
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-20px); }
    }
    
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Allow Enter key to add task
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
