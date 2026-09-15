/* =====================================================
   EUROPE LIVE — CATEGORIES
===================================================== */

function initCategories() {

    const categories =
        document.querySelectorAll(".category");

    categories.forEach(category => {

        category.addEventListener(
            "click",
            event => {

                event.preventDefault();

                categories.forEach(item => {
                    item.classList.remove("active");
                });

                category.classList.add("active");

                const selectedCategory =
                    category.textContent
                        .trim()
                        .toUpperCase();

                const matchingStreams =
                    liveStreams.filter(
                        stream =>
                            stream.category ===
                            selectedCategory
                    );

                if (
                    matchingStreams.length > 0
                ) {

                    loadYouTubeVideo(
                        matchingStreams[0]
                    );

                }

            }
        );

    });

}
