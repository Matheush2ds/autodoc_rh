document.addEventListener("DOMContentLoaded", () => {
    // --- Animação dos números com requestAnimationFrame ---
    document.querySelectorAll(".stat-value").forEach(el => {
        const finalValue = parseInt(el.getAttribute("data-value")) || 0;
        let start = 0;
        const duration = 1000; // 1 segundo
        const startTime = performance.now();

        function animate(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(progress * finalValue);
            el.textContent = currentValue.toLocaleString("pt-BR");

            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });

    // --- Gráfico ---
    if (typeof companyData !== "undefined" && companyData.length > 0) {
        const labels = companyData.map(item => {
            let name = item.company_name;
            return name.length > 30 ? name.substring(0, 27) + "..." : name;
        });
        const data = companyData.map(item => item.count);

        // Gerar cores dinâmicas
        const backgroundColors = labels.map((_, i) => `hsla(${i * 40}, 70%, 60%, 0.6)`);
        const borderColors = labels.map((_, i) => `hsl(${i * 40}, 70%, 40%)`);

        const ctx = document.getElementById("companyChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Documentos Gerados",
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.y} documentos`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
});
