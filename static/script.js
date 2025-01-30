function testAPI() {
    const url = prompt('Enter YouTube video URL:');
    
    if (url) {
        fetch(`/api/youtube-downloader?url=${encodeURIComponent(url)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Response: ${JSON.stringify(data, null, 2)}`);
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(error => alert('Error fetching data'));
    }
}
