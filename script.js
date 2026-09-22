// ==============================
// MiHD Store
// script.js
// ==============================

let appData = [];

const container = document.getElementById("appContainer");
const searchInput = document.getElementById("search");



// ==============================
// Thumbnail mặc định
// ==============================

const DEFAULT_THUMBNAIL =
    "https://raw.githubusercontent.com/guiterhd-bit/mihdtv/main/mstore2.png";



// ==============================
// Escape HTML
// ==============================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// ==============================
// Escape Attribute
// ==============================

function escapeAttribute(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}



// ==============================
// Tạo App ID
// ==============================

function getAppId(app) {

    if (app.id) {
        return String(app.id);
    }

    return String(app.name || "app")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}



// ==============================
// Tạo Card ứng dụng
// ==============================

function createAppCard(app) {

    const card =
        document.createElement("div");

    card.className = "card";



    // ==========================
    // Thumbnail
    // ==========================

    const thumbnail =
        app.thumbnail ||
        DEFAULT_THUMBNAIL;



    // ==========================
    // HTML Card
    // ==========================

    card.innerHTML = `
        <div class="thumbnail-box">

            <img
                class="thumbnail"
                src="${escapeAttribute(thumbnail)}"
                alt="${escapeAttribute(app.name)}"
                loading="lazy"
            >

        </div>


        <div class="card-content">

            <h3 class="app-name">
                ${escapeHTML(app.name)}
            </h3>


            <a
                class="download"
                href="${escapeAttribute(app.file || "#")}"
                target="_blank"
                rel="noopener noreferrer">

                ⬇ Tải về

            </a>

        </div>
    `;



    // ==============================
    // Lấy phần tử
    // ==============================

    const image =
        card.querySelector(".thumbnail");

    const downloadButton =
        card.querySelector(".download");



    // ==============================
    // Xử lý ảnh lỗi
    // ==============================

    image.addEventListener(
        "error",
        function () {

            if (
                image.src !==
                DEFAULT_THUMBNAIL
            ) {

                image.src =
                    DEFAULT_THUMBNAIL;
            }

        }
    );



    // ==============================
    // Nút Tải về
    // ==============================

    downloadButton.addEventListener(
        "click",
        function (event) {

            // Kiểm tra link ứng dụng

            if (!app.file) {

                event.preventDefault();

                alert(
                    "Ứng dụng này chưa có liên kết tải xuống."
                );

                return;
            }

        }
    );



    return card;
}



// ==============================
// Hiển thị danh sách ứng dụng
// ==============================

function renderApps(data) {

    container.innerHTML = "";

    let hasResult = false;



    // ==============================
    // Duyệt danh mục
    // ==============================

    data.forEach(category => {

        if (
            !category ||
            !Array.isArray(category.apps) ||
            category.apps.length === 0
        ) {
            return;
        }



        // ==========================
        // Tạo Category
        // ==========================

        const section =
            document.createElement("section");

        section.className =
            "category";



        section.innerHTML = `
            <h2 class="category-title">
                ${escapeHTML(category.category)}
            </h2>

            <div class="grid"></div>
        `;



        const grid =
            section.querySelector(".grid");



        // ==========================
        // Thêm ứng dụng
        // ==========================

        category.apps.forEach(app => {

            if (
                !app ||
                !app.name
            ) {
                return;
            }



            hasResult = true;



            const card =
                createAppCard(app);



            grid.appendChild(card);

        });



        // Chỉ thêm category
        // nếu có ứng dụng

        if (grid.children.length > 0) {

            container.appendChild(
                section
            );
        }

    });



    // ==============================
    // Không tìm thấy ứng dụng
    // ==============================

    if (!hasResult) {

        container.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    🔍
                </div>

                <div class="empty-title">
                    Không tìm thấy ứng dụng
                </div>

                <div class="empty-text">
                    Hãy thử tìm kiếm với từ khóa khác.
                </div>

            </div>
        `;
    }
}



// ==============================
// Tìm kiếm
// ==============================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();



            // ==========================
            // Không nhập từ khóa
            // ==========================

            if (keyword === "") {

                renderApps(
                    appData
                );

                return;
            }



            // ==========================
            // Lọc ứng dụng
            // ==========================

            const filtered =
                appData.map(category => {

                    return {

                        category:
                            category.category,

                        apps:
                            Array.isArray(
                                category.apps
                            )
                                ? category.apps.filter(
                                    app => {

                                        const name =
                                            String(
                                                app.name || ""
                                            ).toLowerCase();

                                        return name.includes(
                                            keyword
                                        );
                                    }
                                )
                                : []

                    };

                });



            renderApps(
                filtered
            );

        }
    );
}



// ==============================
// Tải apps.json
// ==============================

async function loadApps() {

    try {

        // ==========================
        // Hiển thị loading
        // ==========================

        container.innerHTML = `
            <div class="loading">

                <div class="loading-spinner"></div>

                <div>
                    Đang tải danh sách ứng dụng...
                </div>

            </div>
        `;



        // ==========================
        // Đọc apps.json
        // ==========================

        const response =
            await fetch(
                "apps.json",
                {
                    cache: "no-store"
                }
            );



        if (!response.ok) {

            throw new Error(
                `Không thể đọc apps.json (${response.status})`
            );
        }



        // ==========================
        // Chuyển sang JSON
        // ==========================

        const json =
            await response.json();



        // ==========================
        // Kiểm tra cấu trúc
        // ==========================

        if (Array.isArray(json)) {

            appData =
                json;

        }

        else if (
            json &&
            Array.isArray(
                json.categories
            )
        ) {

            appData =
                json.categories;

        }

        else {

            throw new Error(
                "Cấu trúc apps.json không hợp lệ"
            );
        }



        // ==========================
        // Hiển thị ứng dụng
        // ==========================

        renderApps(
            appData
        );



    } catch (error) {

        console.error(
            "Lỗi tải apps.json:",
            error
        );



        // ==========================
        // Hiển thị lỗi
        // ==========================

        container.innerHTML = `
            <div class="empty error">

                <div class="empty-icon">
                    ⚠️
                </div>

                <div class="empty-title">
                    Không thể tải danh sách ứng dụng
                </div>

                <div class="empty-text">
                    Vui lòng kiểm tra lại file apps.json.
                </div>

            </div>
        `;
    }
}



// ==============================
// Khởi động
// ==============================

loadApps();
