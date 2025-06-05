document.addEventListener("DOMContentLoaded", function() {
    // Crear la instancia del grafo de Cytoscape
    const grafo = cytoscape({
        container: document.getElementById('cy'),

        elements: [
            { data: { id: 'A', duration: 5 }, position: { x: 100, y: 200 } }, // Nodo inicial
            { data: { id: 'B', duration: 8 }, position: { x: 400, y: Math.random() * 200 } },
            { data: { id: 'C', duration: 3 }, position: { x: 400, y: 200 + Math.random() * 200 } },
            { data: { id: 'D', duration: 7 }, position: { x: 600, y: Math.random() * 200 } },
            { data: { id: 'E', duration: 0 }, position: { x: 900, y: 200 } }, // Nodo final
            { data: { name: 'e1', source: 'A', target: 'B', cost: 5 } },
            { data: { name: 'e2', source: 'A', target: 'C', cost: 2 } },
            { data: { name: 'e3', source: 'B', target: 'D', cost: 4 } },
            { data: { name: 'e4', source: 'C', target: 'E', cost: 3 } },
            { data: { name: 'e5', source: 'D', target: 'E', cost: 2 } },
            { data: { name: 'e6', source: 'C', target: 'D', cost: 7 } }
        ],

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#99ccff', 
                    // Formato ID(duración)
                    'label': function(ele) {
                        return ele.data('id') + " (" + ele.data('duration') + ")";
                    }, 
                    // Ajustar tamaño del nodo según el texto
                    'width': function(ele) {
                        const textLength = ele.data('id').length + ele.data('duration').toString().length + 3; 
                        return Math.max(40, textLength * 10);  
                    },
                    'height': function(ele) {
                        const textLength = ele.data('id').length + ele.data('duration').toString().length + 3;
                        return Math.max(40, textLength * 10);  
                    },
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px', 
                    'font-weight': 'bold',
                    'text-wrap': 'wrap',   
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,          
                    'line-color': '#0000ff', 
                    'label': function(ele) {
                        return ele.data('name') + " = " + ele.data('cost');
                    }, 
                    'font-size': '16px',    
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,    
                    'target-arrow-color': '#000', 
                    'target-arrow-shape': function(ele) {
                        return ele.data('bidirectional') ? 'none' : 'triangle';
                    },
                    'curve-style': 'bezier', 
                    'arrow-scale': 1.5 
                }
            },
            {
                selector: 'edge > label',
                style: {
                    'text-background-color': '#fff',
                    'text-background-opacity': 0.7,
                    'text-background-padding': '3px',
                }
            },
        ],

        layout: {
            name: 'preset'
        },

        userPanningEnabled: true,
        userZoomingEnabled: true,
        zoom: 0.5,
        minZoom: 0.3,
        maxZoom: 1.5,
        wheelSensitivity: 0.2
    });

    // Habilitar la capacidad de mover los nodos
    grafo.userPanningEnabled(true);
    // Habilitar la capacidad de hacer zoom
    grafo.userZoomingEnabled(true);

    // Detectar doble clic en nodos
    grafo.on('tap', function(event) {
        resetNodeStyles();
        const ele = event.target;

        if (ele.isNode()) {
            const oldId = ele.id(); // ID actual del nodo
            const newId = prompt("Ingrese el nuevo nombre para el nodo:").trim();

            // Verificar si el nuevo ID ya existe
            if (grafo.getElementById(newId).length > 0) {
                alert("Error: Ya existe un nodo con ese ID.");
                return;
            }

            if (newId) {
                const newDuration = prompt("Ingrese la nueva duración para el nodo:").trim();
                
                // Guardar conexiones existentes (arcos)
                const incomingEdges = grafo.edges(`[target="${oldId}"]`);
                const outgoingEdges = grafo.edges(`[source="${oldId}"]`);

                // Crear el nuevo nodo con el mismo posicionamiento
                const newNode = {
                    group: 'nodes',
                    data: { id: newId, duration: newDuration },
                    position: ele.position() // Mantener la misma posición
                };

                // Agregar el nuevo nodo
                grafo.add(newNode);

                // Reasignar conexiones que entran al nodo
                incomingEdges.forEach(edge => {
                    grafo.add({
                        group: 'edges',
                        data: { source: edge.data('source'), target: newId, name : edge.data('name'), cost: edge.data('cost') }
                    });
                });

                // Reasignar conexiones que salen del nodo

                outgoingEdges.forEach(edge => {
                    grafo.add({
                        group: 'edges',
                        data: { source: newId, target: edge.data('target'), name : edge.data('name'), cost: edge.data('cost') }
                    });
                });

                // Eliminar el nodo antiguo y sus conexiones originales
                ele.remove();

                alert("Nodo renombrado con éxito.");
            }
        }
        // Verificar si el elemento es un arco
        else if (ele.isEdge()) {
            const newName = prompt("Ingrese el nuevo nombre para el arco:").trim();
            const newCost = parseInt(prompt("Ingrese el nuevo costo para el arco:").trim(), 10); // Convertir a entero
        
            if (!isNaN(newCost)) { // Verificar que el costo sea un número válido
                // Cambiar el costo del arco
                ele.data('name', newName);
                ele.data('cost', newCost); 
                // Actualizar la etiqueta visual del arco
                ele.style('label', ele.data('name') + " = " + ele.data('cost'));
            } else {
                alert("El costo ingresado no es válido. Por favor, ingrese un número.");
            }
        }
    });

    // Botón para añadir un nodo
    document.getElementById("addNode").addEventListener("click", function() {
        resetNodeStyles();
        const newNodeId = prompt("Ingrese el nombre del nuevo nodo:").trim(); 

        // Verificar si el nuevo ID ya existe en el grafo
        if (grafo.getElementById(newNodeId).length > 0) {
            alert("Error: Ya existe un nodo con ese nombre.");
            return;
        }

        const newNodeDuration = prompt("Ingrese la duración:").trim();

        // Crear nuevo nodo en una posición fija a la derecha de la pantalla
        const position = { x: 500, y: 100 + Math.random() * 200 };

        grafo.add({
            group: 'nodes',
            data: {
                id: newNodeId,
                duration: newNodeDuration
            },
            position: position
        });
    });

    // Botón para eliminar un nodo
    document.getElementById("removeNode").addEventListener("click", function() {
        resetNodeStyles();
        const nodeIdToRemove = prompt("Ingrese el nombre del nodo a eliminar:").trim();
        const node = grafo.getElementById(nodeIdToRemove);

        if (node) {
            grafo.remove(node);
        } else {
            alert("Nodo no encontrado.");
        }

    });

    // Botón para añadir un arco
    document.getElementById("addEdge").addEventListener("click", function() {
        resetNodeStyles();
        const sourceNode = prompt("Ingrese el nombre del nodo de origen:").trim();
        const targetNode = prompt("Ingrese el nombre del nodo de destino:").trim();
        const cost = parseInt(prompt("Ingrese el costo del arco:").trim(), 10);
        const name = prompt("Ingrese el nombre del arco:").trim(); // Solicitar el nombre del arco

        // Verificar si el nombre del arco ya existe
        const existingEdgeByName = grafo.edges(`[name="${name}"]`);
        if (existingEdgeByName.length > 0) {
            alert("Error: Ya existe un arco con ese nombre.");
            return;
        }

        // Verificar si el arco ya existe
        const existingEdge = grafo.edges(`[source="${sourceNode}"][target="${targetNode}"]`);
        if (existingEdge.length > 0) {
            alert("El arco entre los nodos ya existe.");
            return;
        }

        // Preguntar si el arco es bidireccional
        const isBidirectional = confirm("¿Desea que el arco sea bidireccional?");

        // Añadir el arco al grafo
        grafo.add({
            group: 'edges',
            data: {
                source: sourceNode,
                target: targetNode,
                cost: cost,
                name: name, // Añadir el nombre del arco
                bidirectional: isBidirectional
            }
        });

        alert(`Arco "${name}" añadido con éxito.`);
    });


    // Botón para eliminar un arco
    document.getElementById("removeEdge").addEventListener("click", function() {
        resetNodeStyles();
        const sourceNode = prompt("Ingrese el nombre del nodo de origen del arco:").trim();
        const targetNode = prompt("Ingrese el nombre del nodo de destino del arco:").trim();

        // Eliminar arco
        const edge = grafo.edges(`[source = "${sourceNode}"][target = "${targetNode}"]`);
        if (edge.length > 0) {
            grafo.remove(edge);
        } else {
            alert("Arco no encontrado.");
        }

    });
    // Botón para añadir un grafo con n nodos aleatorios
    document.getElementById("addRandomGraph").addEventListener("click", function() {
        resetNodeStyles();
        let n = parseInt(prompt("Ingrese el número de nodos aleatorios:"));
        if (isNaN(n) || n <= 0) {
            alert("Ingrese un número válido.");
            return;
        }
        
        grafo.elements().remove(); // Eliminar el grafo actual
        // Crear nodos aleatorios
        let nodes = [];
        for (let i = 0; i < n; i++) {
            nodes.push({
                data: { id: "Node" + i, duration: Math.floor(Math.random() * 10) + 1 },
                position: { x: Math.random() * i * 400, y: Math.random() * i *400 }
            });
        }

        // Crear arcos aleatorios
        let edges = [];
        for (let i = 0; i < n - 1; i++) {
            edges.push({ data: { source: "Node" + i, target: "Node" + (i + 1), cost: Math.floor(Math.random() * 10) + 1 } });
        }

        grafo.add(nodes);
        grafo.add(edges);
    });

    // Botón para eliminar todo el grafo
    document.getElementById("clearGraph").addEventListener("click", function() {
        grafo.elements().remove();
    });

    // Export the graph as JSON
    document.getElementById("exportGraph").addEventListener("click", function () {
        resetNodeStyles();
        const graphData = grafo.json(); // Get the graph data as JSON
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphData));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "graph.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        alert("Grafo exportado con éxito.");
    });

    // Import a graph from JSON
    document.getElementById("importGraph").addEventListener("click", function () {
        resetNodeStyles();
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const graphData = JSON.parse(e.target.result);
    
                        // Clear the current graph
                        grafo.elements().remove();
    
                        // Add nodes and edges from the imported graph
                        grafo.json(graphData);
    
                        // Restore dynamic styles for nodes
                        grafo.style()
                            .selector('node')
                            .style({
                                'background-color': '#99ccff',
                                'label': function (ele) {
                                    return ele.data('id') + " (" + ele.data('duration') + ")";
                                },
                                'width': function (ele) {
                                    const textLength = ele.data('id').length + ele.data('duration').toString().length + 3;
                                    return Math.max(40, textLength * 10);
                                },
                                'height': function (ele) {
                                    const textLength = ele.data('id').length + ele.data('duration').toString().length + 3;
                                    return Math.max(40, textLength * 10);
                                },
                                'text-valign': 'center',
                                'text-halign': 'center',
                                'font-size': '12px',
                                'font-weight': 'bold',
                                'text-wrap': 'wrap',
                            })
                            .update();
    
                        // Restore dynamic styles for edges
                        grafo.style()
                            .selector('edge')
                            .style({
                                'width': 2,
                                'line-color': '#0000ff',
                                'label': function (ele) {
                                    return ele.data('name') + " = " + ele.data('cost');
                                },
                                'font-size': '16px',
                                'text-rotation': 'autorotate',
                                'text-margin-y': -10,
                                'target-arrow-color': '#000',
                                'target-arrow-shape': function (ele) {
                                    return ele.data('bidirectional') ? 'none' : 'triangle';
                                },
                                'curve-style': 'bezier',
                                'arrow-scale': 1.5,
                            })
                            .update();
    
                        alert("Grafo importado con éxito.");
                    } catch (error) {
                        alert("Error al importar el grafo. Asegúrate de que el archivo sea válido.");
                    }
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });

    // Exportar el grafo como una imagen
    document.getElementById("exportImage").addEventListener("click", function () {
        resetNodeStyles();
        const imageData = grafo.png({ full: true }); // Generar una imagen PNG del grafo
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", imageData);
        downloadAnchor.setAttribute("download", "graph.png");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        alert("Imagen del grafo exportada con éxito.");
    });

    // Botón para ejecutar el algoritmo de Dijkstra
    document.getElementById("dijkstra").addEventListener("click", function() {
        resetNodeStyles();
        const startNode = prompt("Ingrese el nombre del nodo de inicio:").trim();
        const endNode = prompt("Ingrese el nombre del nodo de destino:").trim();
        const matriz = generarMatrizAdyacencia().matriz;
        const result = dijkstra(matriz, startNode, endNode);
    
        if (result.paths.length > 0) {
            const rutasTexto = result.paths.map(path => `Camino: ${path.join(" -> ")}`).join("\n");
            const rutaTextoCompleta = `Caminos más cortos de ${startNode} a ${endNode}:\n${rutasTexto}\nCosto total: ${result.totalCost}`;
            document.getElementById("rutaOutput").innerText = rutaTextoCompleta;
            alert(rutaTextoCompleta);
        } else {
            const mensajeError = "No hay un camino válido entre los nodos seleccionados.";
            document.getElementById("rutaOutput").innerText = mensajeError;
            alert(mensajeError);
        }
    });

    function dijkstra(matriz, startNode, endNode) {
        let distances = {};
        let previous = {};
        let queue = [];
        let visited = new Set();
        let paths = [];
        let totalCost = 0;
        let currentNode = startNode;
        let nodes = Object.keys(matriz);
    
        // Inicializar distancias y nodos previos
        nodes.forEach(node => {
            distances[node] = Infinity;
            previous[node] = [];
        });
        distances[startNode] = 0;
        queue.push(startNode);
    
        while (queue.length > 0) {
            // Obtener el nodo con la distancia más pequeña
            currentNode = queue.reduce((a, b) => (distances[a] < distances[b] ? a : b));
            queue = queue.filter(node => node !== currentNode);
            visited.add(currentNode);
    
            // Si llegamos al nodo final, construir todas las rutas
            if (currentNode === endNode) {
                let stack = [endNode];
                function buildPaths(node, path) {
                    if (node === startNode) {
                        paths.push([startNode, ...path]);
                        return;
                    }
                    previous[node].forEach(prev => {
                        buildPaths(prev, [node, ...path]);
                    });
                }
                buildPaths(endNode, []);
                break;
            }
    
            // Actualizar distancias para los vecinos
            nodes.forEach(node => {
                if (!visited.has(node) && matriz[currentNode][node] > 0) {
                    let newDistance = distances[currentNode] + matriz[currentNode][node];
                    if (newDistance < distances[node]) {
                        distances[node] = newDistance;
                        previous[node] = [currentNode];
                        if (!queue.includes(node)) {
                            queue.push(node);
                        }
                    } else if (newDistance === distances[node]) {
                        previous[node].push(currentNode);
                    }
                }
            });
        }
    
        // Resaltar los nodos y arcos en todas las rutas óptimas
        paths.forEach(path => {
            path.forEach(node => {
                const cyNode = grafo.getElementById(node);
                cyNode.style({
                    'border-width': '6px',
                    'border-color': 'green',
                    'border-style': 'solid'
                });
            });
    
            for (let i = 0; i < path.length - 1; i++) {
                const edge = grafo.edges(`[source="${path[i]}"][target="${path[i + 1]}"]`);
                if (edge.length > 0) {
                    edge.style({
                        'line-color': 'green',
                        'width': 4
                    });
                }
            }
        });
    
        // Retornar el resultado
        return {
            paths: paths,
            totalCost: distances[endNode]
        };
    }

    document.getElementById("criticalPath").addEventListener("click", function () {
        resetNodeStyles();
        const startNode = prompt("Ingrese el nombre del nodo de inicio:").trim();
        const endNode = prompt("Ingrese el nombre del nodo de destino:").trim();
        const matriz = generarMatrizAdyacencia().matriz;
    
        // Run Critical Path algorithm
        const result = criticalPath(matriz, startNode, endNode);
    
        if (result.paths.length > 0) {
            const rutasTexto = result.paths.map(path => `Ruta: ${path.join(" -> ")}`).join("\n");
            const rutaTextoCompleta = `Rutas críticas de ${startNode} a ${endNode}:\n${rutasTexto}\nCosto total: ${result.totalCost}`;
            document.getElementById("rutaOutput").innerText = rutaTextoCompleta;
            alert(rutaTextoCompleta);
        } else {
            const mensajeError = "No hay una ruta crítica válida entre los nodos seleccionados.";
            document.getElementById("rutaOutput").innerText = mensajeError;
            alert(mensajeError);
        }
    });
    
    function criticalPath(matriz, startNode, endNode) {
        let maxDistances = {};
        let previous = {};
        let nodes = Object.keys(matriz);
    
        // Inicializar las distancias máximas y los nodos previos
        nodes.forEach(node => {
            maxDistances[node] = -Infinity;
            previous[node] = [];
        });
        maxDistances[startNode] = 0;
    
        // Procesar los nodos en orden topológico
        let visited = new Set();
        let stack = [];
    
        function topologicalSort(node) {
            if (visited.has(node)) return;
            visited.add(node);
            nodes.forEach(neighbor => {
                if (matriz[node][neighbor] > 0) {
                    topologicalSort(neighbor);
                }
            });
            stack.push(node);
        }
    
        nodes.forEach(node => topologicalSort(node));
    
        while (stack.length > 0) {
            let currentNode = stack.pop();
            nodes.forEach(neighbor => {
                if (matriz[currentNode][neighbor] > 0) {
                    let newDistance = maxDistances[currentNode] + matriz[currentNode][neighbor];
                    if (newDistance > maxDistances[neighbor]) {
                        maxDistances[neighbor] = newDistance;
                        previous[neighbor] = [currentNode];
                    } else if (newDistance === maxDistances[neighbor]) {
                        previous[neighbor].push(currentNode);
                    }
                }
            });
        }
    
        // Construir todas las rutas críticas
        let paths = [];
        function buildPaths(node, path) {
            if (node === startNode) {
                paths.push([startNode, ...path]);
                return;
            }
            previous[node].forEach(prev => {
                buildPaths(prev, [node, ...path]);
            });
        }
        buildPaths(endNode, []);
    
        // Resaltar los nodos y arcos en todas las rutas críticas
        paths.forEach(path => {
            path.forEach(node => {
                const cyNode = grafo.getElementById(node);
                cyNode.style({
                    'border-width': '6px',
                    'border-color': 'red',
                    'border-style': 'solid'
                });
            });
    
            for (let i = 0; i < path.length - 1; i++) {
                const edge = grafo.edges(`[source="${path[i]}"][target="${path[i + 1]}"]`);
                if (edge.length > 0) {
                    edge.style({
                        'line-color': 'red',
                        'width': 4
                    });
                }
            }
        });
    
        return {
            paths: paths,
            totalCost: maxDistances[endNode]
        };
    }

    function generarMatrizAdyacencia() {
        let nodos = grafo.nodes().map(n => n.id());
        let matriz = {};
    
        // Inicializar la matriz con ceros
        nodos.forEach(nodo => {
            matriz[nodo] = {};
            nodos.forEach(n => matriz[nodo][n] = 0);
        });
    
        // Rellenar la matriz con los costos de los arcos
        grafo.edges().forEach(edge => {
            let source = edge.data('source');
            let target = edge.data('target');
            let cost = edge.data('cost') || 1; // Si no hay costo, usar 1 por defecto
    
            // Asignar el costo de A a B
            matriz[source][target] = cost;
    
            // Si el arco es bidireccional, asignar también el costo de B a A
            if (edge.data('bidirectional')) {
                matriz[target][source] = cost;
            }
        });
    
        return { nodos, matriz };
    }
    
    function actualizarMatriz() {
        let { nodos, matriz } = generarMatrizAdyacencia();
        let table = "<table border='1' style='border-collapse: collapse; text-align: center;'>";
        table += "<tr><th></th>" + nodos.map(n => `<th>${n}</th>`).join("") + "</tr>";
        nodos.forEach(row => {
            table += `<tr><th>${row}</th>`;
            nodos.forEach(col => {
                table += `<td>${matriz[row][col]}</td>`;
            });
            table += "</tr>";
        });
        table += "</table>";
        document.getElementById("matrizOutput").innerHTML = table;
    }
    
    function generarMatrizIncidencia() {
        let nodos = grafo.nodes().map(n => n.id());
        let arcos = grafo.edges().map(e => e.data('name'));
        let matriz = {};
        
        // Inicializar la matriz con ceros
        nodos.forEach(nodo => {
            matriz[nodo] = {};
            arcos.forEach(arco => matriz[nodo][arco] = 0);
        });
        
        // Rellenar la matriz con los costos de los arcos
        grafo.edges().forEach(edge => {
            let source = edge.data('source');
            let target = edge.data('target');
            let name = edge.data('name');
            
            // Asignar el costo del arco a los nodos de origen y destino
            matriz[source][name] = 1;
            matriz[target][name] = -1;
        });
        
        return { nodos, arcos, matriz };
    }
    
    function actualizarMatrizIncidencia() {
        let { nodos, arcos, matriz } = generarMatrizIncidencia();
        let table = "<table border='1' style='border-collapse: collapse; text-align: center;'>";
        table += "<tr><th></th>" + arcos.map(a => `<th>${a}</th>`).join("") + "</tr>";
        nodos.forEach(row => {
            table += `<tr><th>${row}</th>`;
            arcos.forEach(col => {
                table += `<td>${matriz[row][col]}</td>`;
            });
            table += "</tr>";
        });
        table += "</table>";
        document.getElementById("matrizIncidenciaOutput").innerHTML = table;
    }

    function resetNodeStyles() {
        grafo.nodes().forEach(node => {
            node.style({
                'border-width': '0px', // Quitar el borde
                'border-color': 'transparent', // Restablecer el color del borde
            });
        });
        grafo.edges().forEach(edge => {
            edge.style({
                'line-color': '#0000ff', // Restaurar el color original de las aristas
                'width': 2 // Restaurar el ancho original de las aristas
            });
        });
    }

    
    grafo.on('add remove data', actualizarMatrizIncidencia);
    actualizarMatrizIncidencia();
    
    grafo.on('add remove data', actualizarMatriz);
    actualizarMatriz();
});
