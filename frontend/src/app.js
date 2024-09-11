import { backend } from 'declarations/backend';

let quill;
let postModal;

const routes = {
    '/': homePage,
    '/post': postPage
};

document.addEventListener('DOMContentLoaded', async () => {
    quill = new Quill('#editor', {
        theme: 'snow'
    });

    postModal = new bootstrap.Modal(document.getElementById('postModal'));

    const newPostBtn = document.getElementById('newPostBtn');
    const newPostForm = document.getElementById('newPostForm');

    newPostBtn.addEventListener('click', () => {
        postModal.show();
    });

    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const body = quill.root.innerHTML;

        try {
            showSpinner();
            const result = await backend.createPost(title, body, author);
            if ('ok' in result) {
                await router();
                postModal.hide();
                newPostForm.reset();
                quill.setContents([]);
            } else {
                console.error('Failed to create post:', result.err);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            hideSpinner();
        }
    });

    window.addEventListener('popstate', router);
    document.body.addEventListener('click', handleNavigation);

    await router();
});

async function router() {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];
    await route();
}

async function homePage() {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="posts"></div>';
    await fetchAndDisplayPosts();
}

async function postPage() {
    const app = document.getElementById('app');
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        app.innerHTML = '<h2>Post not found</h2>';
        return;
    }

    try {
        showSpinner();
        const result = await backend.getPost(Number(postId));
        if ('ok' in result) {
            const post = result.ok;
            app.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-meta">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div>${post.body}</div>
                <a href="/" class="btn btn-primary mt-3">Back to Home</a>
            `;
        } else {
            app.innerHTML = '<h2>Post not found</h2>';
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        app.innerHTML = '<h2>Error loading post</h2>';
    } finally {
        hideSpinner();
    }
}

async function fetchAndDisplayPosts() {
    try {
        showSpinner();
        const posts = await backend.getPosts();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';

        posts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h2><a href="/post?id=${post.id}" class="post-title">${post.title}</a></h2>
                <div class="post-meta">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div>${post.body.substring(0, 200)}...</div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    } finally {
        hideSpinner();
    }
}

function handleNavigation(e) {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        window.history.pushState(null, '', href);
        router();
    }
}

function showSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    document.body.appendChild(spinner);
}

function hideSpinner() {
    const spinner = document.querySelector('.spinner-border');
    if (spinner) {
        spinner.remove();
    }
}
