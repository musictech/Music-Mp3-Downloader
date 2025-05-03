document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (!query) {
        resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }

    try {
        const response = await fetch(`https://your-backend-url.com/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Network response is not okay');
        }
        const results = await response.json();

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';

            const img = document.createElement('img');
            img.src = item.thumbnail;
            img.alt = item.title;
            img.className = 'result-thumbnail';

            const title = document.createElement('div');
            title.className = 'result-title';
            title.textContent = item.title;

            const playButton = document.createElement('button');
            playButton.textContent = 'Play';
            playButton.className = 'play-button';

            const audio = document.createElement('audio');
            audio.src = `https://your-backend-url.com/download?id=${item.videoId}`;
            audio.controls = true;
            audio.style.display = 'none';

            playButton.addEventListener('click', () => {
                document.querySelectorAll('audio').forEach(aud => {
                    if (aud !== audio) {
                        aud.pause();
                        aud.currentTime = 0;
                        aud.style.display = 'none';
                    }
                });

                if (audio.style.display === 'none') {
                    audio.style.display = 'inline-block';
                    audio.play();
                    playButton.textContent = 'Pause';
                } else {
                    audio.pause();
                    audio.style.display = 'none';
                    playButton.textContent = 'Play';
                }
            });

            div.appendChild(img);
            div.appendChild(title);
            div.appendChild(playButton);
            div.appendChild(audio);

            resultsContainer.appendChild(div);
        });
    } catch (error) {
        resultsContainer.innerHTML = `<p>Error: Unable to fetch results. Please try again later.</p>`;
    }
});
