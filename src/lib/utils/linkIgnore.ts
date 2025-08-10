
export function linkIgnore() {
  const ignoreLinks = document.querySelectorAll('a.ignore');

  ignoreLinks.forEach(link => {
    link.addEventListener('click', function(event: Event) {
      event.preventDefault(); // デフォルトのアクションを無効にする
    });
  });
}
