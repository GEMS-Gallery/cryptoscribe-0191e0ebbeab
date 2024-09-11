import { backend } from 'declarations/backend';

let quill;
let postModal;

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
                await fetchAndDisplayPosts();
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

    await fetchAndDisplayPosts();
});

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
                <h2>${post.title}</h2>
                <div class="post-meta">By ${post.author} on ${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</div>
                <div>${post.body}</div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    } finally {
        hideSpinner();
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
