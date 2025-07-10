// // Inizializzazione Konva
// let stage = new Konva.Stage({
//     container: "container",
//     width: window.innerWidth,
//     height: window.innerHeight - 50,
//     draggable: true,
// });

// stage.on("contextmenu", (e) => {
//     e.evt.preventDefault();
// });

// window.addEventListener("resize", () => {
//     stage.width(window.innerWidth);
//     stage.height(window.innerHeight - 50);
// });

// let layer = new Konva.Layer();
// stage.add(layer);

// // Strutture dati
// let entities = [];
// let relationships = [];
// let relationshipID = 0;

// let selected = null;

// let relationMode = false;
// let firstRelationEntity = null;
// let pendingNameTarget = null; // Riferimento al nodo di testo da rinominare

// /*
// ███████╗ ██████╗  ██████╗ ███╗   ███╗
// ╚══███╔╝██╔═══██╗██╔═══██╗████╗ ████║
//   ███╔╝ ██║   ██║██║   ██║██╔████╔██║
//  ███╔╝  ██║   ██║██║   ██║██║╚██╔╝██║
// ███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║
// ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
// */

// stage.on("wheel", (e) => {
//     e.evt.preventDefault();
//     const oldScale = stage.scaleX();
//     const pointer = stage.getPointerPosition();

//     const delta = e.evt.deltaY > 0 ? 1 : -1;
//     const newScale = Math.max(
//         0.5,
//         Math.min(4, delta < 0 ? oldScale * 1.2 : oldScale / 1.2)
//     );

//     const mousePointTo = {
//         x: (pointer.x - stage.x()) / oldScale,
//         y: (pointer.y - stage.y()) / oldScale,
//     };

//     stage.scale({ x: newScale, y: newScale });
//     stage.position({
//         x: pointer.x - mousePointTo.x * newScale,
//         y: pointer.y - mousePointTo.y * newScale,
//     });
//     layer.batchDraw();
// });

// /*
// ███████╗███╗   ██╗████████╗██╗████████╗██╗   ██╗
// ██╔════╝████╗  ██║╚══██╔══╝██║╚══██╔══╝╚██╗ ██╔╝
// █████╗  ██╔██╗ ██║   ██║   ██║   ██║    ╚████╔╝
// ██╔══╝  ██║╚██╗██║   ██║   ██║   ██║     ╚██╔╝  
// ███████╗██║ ╚████║   ██║   ██║   ██║      ██║  
// ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝   ╚═╝      ╚═╝  
                                               
// */
// function createEntity(x, y) {
//     const entity = {
//         rect: new Konva.Rect({
//             x,
//             y,
//             width: 120,
//             height: 60,
//             fill: "#fff",
//             stroke: "#333",
//             strokeWidth: 2,
//             draggable: true,
//         }),
//         text: new Konva.Text({
//             text: "Entità",
//             fontSize: 16,
//             fontFamily: "Arial",
//             fill: "#333",
//             width: 120,
//             align: "center",
//             wrap: "word",
//             padding: 10,
//             listening: false,
//         }),
//         resize: new Konva.Line({
//             points: [x, y, x + 15, y, x, y + 15],
//             fill: "#fff0",
//             stroke: "#4CAF50",
//             strokeWidth: 3,
//             closed: true,
//         }),
//         attributes: [],
//         composedKey: false,
//         composedKeyRel: false,
//         Composed: {
//             line: null,
//             circle: null,
//             rel: null
//         },
//         isParent: false,
//         isChildren: false
//     };

//     // Centra il testo all'interno del rettangolo
//     entity.text.position({
//         x: entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
//         y: entity.rect.y() + (entity.rect.height() - entity.text.height()) / 2,
//     });

//     entity.rect.on("dragmove", () => {
//         entity.text.position({
//             x: entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
//             y: entity.rect.y() + (entity.rect.height() - entity.text.height()) / 2,
//         });

//         entity.resize.points([
//             entity.rect.x(),
//             entity.rect.y(),
//             entity.rect.x() + 15,
//             entity.rect.y(),
//             entity.rect.x(),
//             entity.rect.y() + 15,
//         ]);
//         updateAllConnections();
//     });

//     // do something else on right click
//     entity.resize.on("click", (e) => {
//         if (e.evt.button === 2) {
//             let transform;
//             if (transform == null) {
//                 transform = new Konva.Transformer({
//                     nodes: [entity.rect],
//                     enabledAnchors: [
//                         "top-left",
//                         "top-right",
//                         "top-center",
//                         "bottom-left",
//                         "middle-right",
//                         "middle-left",
//                         "bottom-right",
//                     ],
//                 });
//                 transform.on("click", (ev) => {
//                     if (ev.evt.button === 2) {
//                         // entity.rect.width(transform.width()-2)

//                         transform.destroy();
//                     }
//                 });
//                 transform.on("transformend", (ev) => {
//                     entity.rect.width(transform.width() - 2);
//                     entity.rect.height(transform.height() - 2);
//                     entity.rect.scaleX(1);
//                     entity.rect.scaleY(1);
//                 });

//                 transform.on("transform", (ev) => {
//                     entity.text.position({
//                         x:
//                             entity.rect.x() + (entity.rect.width() - entity.text.width()) / 2,
//                         y:
//                             entity.rect.y() +
//                             (entity.rect.height() - entity.text.height()) / 2,
//                     });
//                     entity.resize.points([
//                         entity.rect.x(),
//                         entity.rect.y(),
//                         entity.rect.x() + 15,
//                         entity.rect.y(),
//                         entity.rect.x(),
//                         entity.rect.y() + 15,
//                     ]);
//                     updateAllConnections();
//                 });

//                 transform.rotateEnabled(false);
//                 layer.add(transform);
//             }
//         }
//     });

//     entity.rect.on("dblclick", () => showNameModal(entity.text));

//     layer.add(entity.rect);
//     layer.add(entity.text);
//     layer.add(entity.resize);
//     entities.push(entity);
//     layer.batchDraw();
//     return entity;
// }

// // Aggiorna tutte le connessioni (relazioni) quando una entità si sposta


// function updateAllConnections() {
//     relationships.forEach(rel => {
//         const rhombusPos = rel.rhombus.position();

//         // Aggiorna le cardinalità (labels) posizionandole a metà tra il bordo dell'entità e il rombo
//         rel.entities.forEach((entity, i) => {
//             const edgePoint = getEdgePoint(entity, rhombusPos);
//             rel.cards[i].position({
//                 x: (edgePoint.x + rhombusPos.x) / 2 - 10,
//                 y: (edgePoint.y + rhombusPos.y) / 2 - 15
//             });
//         });

//         // Centra il testo della relazione sul rombo
//         rel.text.position({
//             x: rhombusPos.x - rel.text.width() / 2,
//             y: rhombusPos.y - rel.text.height() / 2
//         });
//         let zonesUsed = {
//           sopra: false,
//           sotto: false,
//           sinistra: false,
//           destra: false
//         };

//         // Se ci sono entità nella relazione, calcola i "corner" (top, bottom, left, right)
//         if (rel.entities.length > 0) {
//             // Inizializzazione con la prima entità
//             let topEntity = rel.entities[0],
//                 bottomEntity = rel.entities[0],
//                 leftEntity = rel.entities[0],
//                 rightEntity = rel.entities[0];

//             let firstEntityCenterX =
//                 rel.entities[0].rect.x() + rel.entities[0].rect.width() / 2;
//             let firstEntityCenterY =
//                 rel.entities[0].rect.y() + rel.entities[0].rect.height() / 2;
//             let topY = firstEntityCenterY;
//             let bottomY = firstEntityCenterY;
//             let leftX = firstEntityCenterX;
//             let rightX = firstEntityCenterX;

//             // Funzione per determinare la zona in cui cade un punto rispetto al rombo
//             function getZone(px, py, rhombus) {
//                 const cx = rhombus.x(); // Centro X del rombo
//                 const cy = rhombus.y(); // Centro Y del rombo

//                 const dx = px - cx;
//                 const dy = py - cy;

//                 // Se il punto è molto vicino al centro, lo consideriamo "centro"
//                 if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
//                     return "centro";
//                 }

//                 // Calcola l'angolo in gradi
//                 let angle = Math.atan2(dy, dx) * (180 / Math.PI);
//                 if (angle < 0) angle += 360;


//                 // Zone principali (cardinali)
//                 if (angle >= 45 && angle < 135) return "sopra";
//                 if (angle >= 135 && angle < 225) return "sinistra";
//                 if (angle >= 225 && angle < 315) return "sotto";
//                 if (angle >= 315 || angle < 45) return "destra";


//                 // Zone intermedie (diagonali)
//                 if (angle >= 22.5 && angle < 67.5) return "basso-destra";
//                 if (angle >= 112.5 && angle < 157.5) return "basso-sinistra";
//                 if (angle >= 202.5 && angle < 247.5) return "alto-sinistra";
//                 if (angle >= 292.5 && angle < 337.5) return "alto-destra";

//                 return "fuori"; // Caso particolare (non dovrebbe accadere)
//             }

//             // Calcola i corner basandosi sul centro di ciascuna entità
//             rel.entities.forEach((entity, i) => {
//                 const centerX = entity.rect.x() + entity.rect.width() / 2;
//                 const centerY = entity.rect.y() + entity.rect.height() / 2;

//                 // Valuta la zona rispetto al rombo usando il centro dell'entità
//                 const zone = getZone(centerX, centerY, rel.rhombus);
//                 let entityPos = {
//                     x : 0,
//                     y : 0
//                 }
//                 let rhombusPosTrue = {
//                     x: 0,
//                     y: 0
//                 }
//                 switch (zone) {
//                     case "sotto":
//                         entityPos.x = (entity.rect.width()/2)+entity.rect.x()
//                         entityPos.y = entity.rect.height()+entity.rect.y()
//                         rhombusPosTrue.x = rel.rhombus.x()
//                         rhombusPosTrue.y = rel.rhombus.y()-(rel.rhombus.radius()*0.7)
//                         topEntity = entity;
//                         break;
//                     case "sopra":
//                         entityPos.x = (entity.rect.width()/2)+entity.rect.x()
//                         entityPos.y = entity.rect.y()
//                         rhombusPosTrue.x = rel.rhombus.x()
//                         rhombusPosTrue.y = rel.rhombus.y()+(rel.rhombus.radius()*0.7)
//                         bottomEntity = entity;
//                         break;
//                     case "destra":
//                         entityPos.x = entity.rect.x()
//                         entityPos.y = (entity.rect.height()/2)+entity.rect.y()
//                         rhombusPosTrue.x = rel.rhombus.x()+rel.rhombus.radius()
//                         rhombusPosTrue.y = rel.rhombus.y()
//                         rightEntity = entity;
//                         break;
//                     case "sinistra":
//                         entityPos.x = entity.rect.x()+entity.rect.width()
//                         entityPos.y = (entity.rect.height()/2)+entity.rect.y()
//                         rhombusPosTrue.x = rel.rhombus.x()-rel.rhombus.radius()
//                         rhombusPosTrue.y = rel.rhombus.y()
//                         leftEntity = entity;
//                         break;
//                     // Le diagonali possono essere gestite se necessario
//                     default:
//                         break;
//                 }
                
//                 rel.lines[i].points([
//                     entityPos.x,
//                     entityPos.y,
//                     rhombusPosTrue.x,
//                     rhombusPosTrue.y
//                 ]);

//             });

//             // Assegna le entità calcolate come corner della relazione
//             rel.cornersEntity = {
//                 top: topEntity,
//                 bottom: bottomEntity,
//                 left: leftEntity,
//                 right: rightEntity
//             };
//         }
//     });
//     layer.batchDraw();
// }




// /*
//  █████╗ ████████╗████████╗██████╗ ██╗██████╗ ██╗   ██╗████████╗███████╗
// ██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██║██╔══██╗██║   ██║╚══██╔══╝██╔════╝
// ███████║   ██║      ██║   ██████╔╝██║██████╔╝██║   ██║   ██║   █████╗  
// ██╔══██║   ██║      ██║   ██╔══██╗██║██╔══██╗██║   ██║   ██║   ██╔══╝  
// ██║  ██║   ██║      ██║   ██║  ██║██║██████╔╝╚██████╔╝   ██║   ███████╗
// ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
// */

// function addAttribute() {

//     Swal.fire({
//         "title": "Aggiungere un attributo",
//         "text": "Seleziona prima un entità oppure una associazione",
//         "icon": "info"
//     })

//     const handler = (e) => {
//         let targetEntity = entities.find((entity) => entity.rect === e.target);
//         let targetRel = relationships.find((rel) => rel.rhombus === e.target);

//         if (!targetEntity && !targetRel) {
//             Swal.fire({
//                 "title": "Errore",
//                 "text": "Nessun elemento selezionato!",
//                 "icon": "warning"
//             })
//             stage.off("click tap", handler);
//             return;
//         }

//         showAttributeModal((attrName, isPrimaryKey) => {
//             if (targetEntity) {
//                 // Codice esistente per attributi su entità...
//                 // Dentro il blocco if (targetEntity)
//                 const entity = targetEntity;
//                 const attr = {
//                     circle: new Konva.Circle({
//                         radius: 5,
//                         fill: isPrimaryKey ? "#333" : "#fff",
//                         stroke: "#333",
//                         strokeWidth: isPrimaryKey ? 5 : 5,
//                         draggable: true,
//                     }),
//                     text: new Konva.Text({
//                         text: attrName,
//                         fontSize: 14,
//                         fontFamily: "Arial",
//                         fill: "#333",
//                         fontStyle: isPrimaryKey ? "bold" : "normal",
//                         padding: 5,
//                         listening: false,
//                     }),
//                     line: new Konva.Line({
//                         stroke: "#333",
//                         strokeWidth: 2,
//                         draggable: false,
//                     }),
//                     attached: true,
//                     isPrimaryKey: isPrimaryKey,
//                 };

//                 // Calcola il punto di collegamento
//                 const total = entity.attributes.length + 1;
//                 const index = entity.attributes.length;
//                 const connectionPoint = getConnectionPoint(entity, index, total);

//                 // Posizione iniziale
//                 const startPos = {
//                     x: connectionPoint.x + 20,
//                     y: connectionPoint.y,
//                 };

//                 attr.circle.position(startPos);
//                 attr.text.position({
//                     x: startPos.x + 15,
//                     y: startPos.y - 7,
//                 });
//                 attr.line.points([
//                     connectionPoint.x,
//                     connectionPoint.y,
//                     startPos.x,
//                     startPos.y,
//                 ]);

//                 // Funzione di update
//                 const updatePosition = () => {
//                     if (attr.attached) {
//                         const attachedAttrs = entity.attributes.filter((a) => a.attached);
//                         const idx = attachedAttrs.indexOf(attr);
//                         const effectiveIndex = idx === -1 ? entity.attributes.length : idx;
//                         //const totalAttached = attachedAttrs.length ? attachedAttrs.length : 1;

//                         const newConnPoint = getConnectionPoint(
//                             entity,
//                             effectiveIndex,
//                             // totalAttached + 1
//                             2
//                         );

//                         attr.line.points([
//                             newConnPoint.x,
//                             newConnPoint.y,
//                             attr.circle.x(),
//                             attr.circle.y(),
//                         ]);
//                     } else {
//                         attr.line.points([
//                             connectionPoint.x,
//                             connectionPoint.y,
//                             attr.circle.x(),
//                             attr.circle.y(),
//                         ]);
//                     }
//                     attr.text.position({
//                         x: attr.circle.x() + 15,
//                         y: attr.circle.y() - 7,
//                     });
//                 };

//                 // Gestione eventi
//                 entity.rect.on("dragmove", () => {

//                     entity.attributes.forEach(element => {
//                         function clamp(value, min, max) {
//                             return Math.max(min, Math.min(max, value));
//                         }

//                         let X = clamp(element.circle.x(), entity.rect.x(), entity.rect.x() + entity.rect.width());

//                         let Y = clamp(element.circle.y(), entity.rect.y(), entity.rect.y() + entity.rect.height());
//                         element.line.points([
//                             X,
//                             Y,
//                             element.circle.x(),
//                             element.circle.y(),
//                         ]);


//                         element.text.x(element.circle.x() - element.circle.radius());
//                         element.text.y(element.circle.y() - 25);
//                     });
//                     createLineConnectionPrimary(entity)

//                     layer.batchDraw();
//                 });


//                 // Salviamo la posizione iniziale valida
//                 let lastValidX = attr.circle.x();
//                 let lastValidY = attr.circle.y();

//                 function clamp(value, min, max) {
//                     return Math.max(min, Math.min(max, value));
//                 }

//                 function lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
//                     const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
//                     if (denominator === 0) return false; // segmenti paralleli o coincidenti
//                     const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
//                     const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
//                     return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
//                 }

//                 // Usare dragBoundFunc per controllare e limitare il movimento
//                 attr.circle.dragBoundFunc(function (pos) {
//                     // Calcoliamo il punto iniziale "fisso" della linea (clamp sulla rect)
//                     let candidateX = clamp(pos.x, entity.rect.x(), entity.rect.x() + entity.rect.width());
//                     let candidateY = clamp(pos.y, entity.rect.y(), entity.rect.y() + entity.rect.height());

//                     let intersected = false;
//                     if (entity.Composed?.line && !attr.isPrimaryKey) {
//                         let points = entity.Composed.line.points();
//                         // Verifica intersezione con ogni segmento della linea composta
//                         for (let i = 0; i < points.length - 3; i += 2) {
//                             if (
//                                 lineSegmentsIntersect(
//                                     points[i], points[i + 1], points[i + 2], points[i + 3],
//                                     candidateX, candidateY, pos.x, pos.y
//                                 )
//                             ) {
//                                 intersected = true;
//                                 break;
//                             }
//                         }
//                     }

//                     // Se c'è intersezione, torna all'ultima posizione valida
//                     if (intersected) {
//                         return { x: lastValidX, y: lastValidY };
//                     } else {
//                         // Altrimenti, aggiorna l'ultima posizione valida e consenti il movimento
//                         lastValidX = pos.x;
//                         lastValidY = pos.y;
//                         return pos;
//                     }
//                 });

//                 // Durante il dragmove aggiorniamo la linea e il testo
//                 attr.circle.on("dragmove", function (e) {
//                     let currentX = attr.circle.x();
//                     let currentY = attr.circle.y();
//                     let clampedX = clamp(currentX, entity.rect.x(), entity.rect.x() + entity.rect.width());
//                     let clampedY = clamp(currentY, entity.rect.y(), entity.rect.y() + entity.rect.height());

//                     attr.line.points([clampedX, clampedY, currentX, currentY]);
//                     createLineConnectionPrimary(targetEntity);
//                     attr.text.x(currentX - attr.circle.radius());
//                     attr.text.y(currentY - 25);
//                     layer.batchDraw();
//                 });

//                 // Alla fine del drag, forziamo la posizione all'ultima valida
//                 attr.circle.on("dragend", function () {
//                     attr.circle.position({ x: attr.line.points()[2], y: attr.line.points()[3] });
//                     layer.batchDraw();
//                     createLineConnectionPrimary(targetEntity)
//                 });


//                 // Doppio click per modificare
//                 attr.circle.on("dblclick", () => {
//                     showAttributeModal(
//                         (newName, newPrimaryKey) => {
//                             attr.text.text(newName);
//                             attr.text.fontStyle(newPrimaryKey ? "bold" : "normal");
//                             attr.circle.fill(newPrimaryKey ? "#333" : "#fff");
//                             attr.circle.stroke(newPrimaryKey ? "#333" : "#333");
//                             attr.circle.strokeWidth(newPrimaryKey ? 5 : 5);
//                             attr.isPrimaryKey = newPrimaryKey;
//                             layer.batchDraw();
//                         },
//                         attr.text.text(),
//                         attr.isPrimaryKey,
//                         attr
//                     );
//                     createLineConnectionPrimary(targetEntity)
//                 });

//                 // Aggiunta al layer
//                 entity.attributes.push(attr);

//                 let PrimaryKey = targetEntity.attributes.filter(obj => obj.isPrimaryKey);
//                 if (PrimaryKey.length > 1) {
//                     PrimaryKey
//                     targetEntity.composedKey = true;
//                 } else {
//                     targetEntity.composedKey = false;
//                 }



//                 createLineConnectionPrimary(targetEntity)
//                 function createLineConnectionPrimary(entity) {
                    
//                     if (!entity.composedKey) return;
                    
//                     if(entity.composedKey != null && PrimaryKey.length <= 1){
//                         entity.Composed.line.destroy();
//                         entity.Composed.circle.destroy();
//                     }

//                     // Costanti configurabili
//                     const OFFSET = 15;
//                     const LINE_STYLE = {
//                         stroke: "#4CAF50",
//                         strokeWidth: 3,
//                         lineJoin: 'round'
//                     };


//                     // Funzione helper per determinare la posizione
//                     const getAttributePosition = (attr) => {
//                         const rect = entity.rect;
                        
//                         let x = 0;
//                         let y = 0;

//                         if(attr.line!= null){
//                             x = attr.line.points()[0];
//                             y = attr.line.points()[1];
//                         }else{
//                             x = attr.x
//                             y = attr.y
//                         }

//                         if (Math.abs(x - rect.x()) < 5) return 'left';
//                         if (Math.abs(x - (rect.x() + rect.width())) < 5) return 'right';
//                         if (Math.abs(y - rect.y()) < 5) return 'top';
//                         if (Math.abs(y - (rect.y() + rect.height())) < 5) return 'bottom';
//                         return 'unknown';
//                     };

//                     // Pulisci la connessione esistente
//                     if (entity.Composed?.line) {
//                         entity.Composed.line.destroy();
//                         entity.Composed.circle.destroy();
//                         // entity.Composed = null;
//                     }

//                     let primaryAttributes = entity.attributes.filter(attr => attr.isPrimaryKey);
//                     const coords = [];
//                     let previousPosition = null;
//                     let previousCoords = null;


//                     primaryAttributes.forEach(element => {
//                         element.circle.fill("#fff")
//                     });

//                     let rectData = getRectData(entity.rect)

//                     console.log(entity.composedKeyRel)

//                     if (entity.composedKeyRel) {
//                         entity.Composed.rel.entities.forEach((relEntity, index) => {
//                             if (relEntity.rect._id === entity.rect._id) {
//                                 const line = entity.Composed.rel.lines[index]; // Prendi la linea corrispondente
//                                 if (line) {
//                                     primaryAttributes.push({
//                                         x:line.points()[0],
//                                         y:line.points()[1]
//                                     })
//                                 }
//                             }
//                         });
//                     }

//                     let arrs = {
//                         top : [],
//                         bottom : [],
//                         left : [],
//                         right : [],
//                     }
//                     primaryAttributes.forEach(element => {
//                         let pos = getAttributePosition(element)
                        
//                         switch(pos){
//                             case 'left':
//                             case 'right': 
//                             case 'bottom': 
//                             case 'top':
//                                 arrs[pos].push(element)
//                                 break
//                             default:
//                                 console.warn("OCIO FEDE! UNKNOWN")
//                                 break
//                         }
//                     });

//                     // Ordinamento per "top" (crescente in base a x)
//                     arrs.top.sort((a, b) => {
//                         const aX = a.line != null ? a.line.points()[0]: a.x;
//                         const bX = b.line != null ? b.line.points()[0]: b.x;
//                         return aX - bX; // crescente
//                     });

//                     // Ordinamento per "bottom" (decrescente in base a x)
//                     arrs.bottom.sort((a, b) => {
//                         const aX = a.line != null ? a.line.points()[0]: a.x;
//                         const bX = b.line != null ? b.line.points()[0]: b.x;
//                         return bX - aX; // decrescente
//                     });

//                     // Ordinamento per "right" (crescente in base a y)
//                     arrs.right.sort((a, b) => {
//                         const aY = a.line != null ? a.line.points()[1]: a.y;
//                         const bY = b.line != null ? b.line.points()[1]: b.y;
//                         return aY - bY; // crescente
//                     });

//                     // Ordinamento per "left" (decrescente in base a y)
//                     arrs.left.sort((a, b) => {
//                         const aY = a.line != null ? a.line.points()[1]: a.y;
//                         const bY = b.line != null ? b.line.points()[1]: b.y;
//                         return bY - aY; // decrescente
//                     });
                    
//                     primaryAttributes = []
//                     primaryAttributes = primaryAttributes.concat(arrs.top)
//                     primaryAttributes = primaryAttributes.concat(arrs.right)
//                     primaryAttributes = primaryAttributes.concat(arrs.left)
//                     primaryAttributes = primaryAttributes.concat(arrs.bottom)
                    
//                     primaryAttributes.forEach((attr, index, arrayAttr) => {
//                         const [x, y] = attr.line !=null ? attr.line.points() : [attr.x, attr.y];

//                         const currentPosition = getAttributePosition(attr);

//                         // Calcola coordinate con offset
//                         const offsetCoord = {
//                             x: x + (currentPosition === 'right' ? OFFSET : currentPosition === 'left' ? -OFFSET : 0),
//                             y: y + (currentPosition === 'bottom' ? OFFSET : currentPosition === 'top' ? -OFFSET : 0)
//                         };

//                         // Gestione transizioni
//                         if (index > 0 && previousPosition) {
//                             const transitionKey = `${previousPosition}-${currentPosition}`.toLowerCase();


//                             const transitionPoints = calculateTransitionPoints(
//                                 previousPosition,
//                                 currentPosition,
//                                 entity.rect,
//                                 previousCoords,
//                                 offsetCoord,
//                                 arrayAttr
//                             );
//                             if (transitionPoints.length > 0) {
//                                 coords.push(...transitionPoints.flat());
//                             }
//                         }

//                         coords.push(offsetCoord.x, offsetCoord.y);
//                         previousPosition = currentPosition;
//                         previousCoords = offsetCoord;
//                     });


//                     let First_Last = {
//                         PrimoPunto: { x: coords[0], y: coords[1] },
//                         UltimoPunto: { x: coords[coords.length - 2], y: coords[coords.length - 1] }
//                     }

//                     // console.log(getDirection(First_Last.PrimoPunto, {x:coords[2], y:coords[3]}))

//                     coords[0] = coords[0] + getDirection(First_Last.PrimoPunto, { x: coords[2], y: coords[3] }).x
//                     coords[1] = coords[1] + getDirection(First_Last.PrimoPunto, { x: coords[2], y: coords[3] }).y


//                     try {
//                         coords[coords.length - 2] = coords[coords.length - 2] + getDirection(First_Last.UltimoPunto, { x: coords[coords.length - 4], y: coords[coords.length - 3] }).x
//                         coords[coords.length - 1] = coords[coords.length - 1] + getDirection(First_Last.UltimoPunto, { x: coords[coords.length - 4], y: coords[coords.length - 3] }).y
//                     } catch {}

//                     function getDirection(firstPoint, secondPoint) {

//                         try {
//                             if (firstPoint.x == secondPoint.x) {
//                                 return firstPoint.y < secondPoint.y ? { x: 0, y: -15 } : { x: 0, y: +15 }
//                             } else {
//                                 if (firstPoint.y == secondPoint.y) {
//                                     return firstPoint.x < secondPoint.x ? { y: 0, x: -15 } : { y: 0, x: +15 }
//                                 }
//                             }
//                         } catch (error) { }
//                     }
//                     // console.log(coords)
//                     // Crea e aggiungi la linea (senza chiudere il percorso)
//                     const connectionLine = new Konva.Line({
//                         points: coords,
//                         ...LINE_STYLE
//                     });

//                     console.log(connectionLine)

//                     // Sostituisci la creazione del cerchio con:
//                     let circleComposed = new Konva.Circle({
//                         x: connectionLine.points()[connectionLine.points().length - 2],
//                         y: connectionLine.points()[connectionLine.points().length - 1],
//                         radius: 7,
//                         fill: "#4CAF50",
//                         stroke: "#2E7D32",
//                         strokeWidth: 2,
//                     });

//                     entity.Composed = { line: connectionLine, circle: circleComposed, rel: entity.Composed.rel };
//                     layer.add(connectionLine);
//                     layer.add(circleComposed);
//                     layer.batchDraw();

//                     function calculateTransitionPoints(prevPos, currPos, rect, prevCoord, currCoord, array) {

//                         const EDGE_OFFSET = 5; // Valore per gli aggiustamenti

//                         const isLast = index === array.length - 1;

//                         const transitions = {
//                             'top-bottom': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET],    // Angolo sinistro superiore
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET] // Angolo sinistro inferiore
//                             ],
//                             'bottom-top': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET], // Angolo destro inferiore
//                                 [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]  // Angolo destro superiore
//                             ],
//                             'top-right': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]
//                             ],
//                             'right-bottom': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'bottom-right': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'bottom-left': [
//                                 [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'left-bottom': [
//                                 [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'left-top': [
//                                 [rect.x() - OFFSET, rect.y() - OFFSET]
//                             ],
//                             'right-left': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET],
//                                 [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'left-right': [
//                                 [rect.x() - OFFSET, rect.y() + rect.height() + OFFSET],
//                                 [rect.x() + rect.width() + OFFSET, rect.y() + rect.height() + OFFSET]
//                             ],
//                             'top-left': [
//                                 [rect.x() - OFFSET, rect.y() - OFFSET]
//                             ],
//                             'right-top': [
//                                 [rect.x() + rect.width() + OFFSET, rect.y() - OFFSET]
//                             ]
//                         };


//                         const transitionKey = `${prevPos}-${currPos}`.toLowerCase();
//                         let points = transitions[transitionKey] ? [...transitions[transitionKey]] : [];

//                         return points;
//                     }
//                 }



//                 // Funzione helper per calcolare i punti di transizione

//                 const hasRelationships = relationships.some(rel =>
//                     rel.entities.some(e => e.rect._id === entity.rect._id)
//                 );
//                 console.log(hasRelationships)

//                 if (targetEntity.composedKey && hasRelationships) {
//                     Swal.fire({
//                         title: "Unire la chiave composta?",
//                         text: "Vuoi collegare queste chiavi primarie con le associazioni?",
//                         icon: "question",
//                         showCancelButton: true,
//                         confirmButtonColor: "#4CAF50",
//                         cancelButtonColor: "#d33",
//                         confirmButtonText: "✅ Sì, unisci!",
//                         cancelButtonText: "❌ No, grazie"
//                     }).then((result) => {
//                         if (result.isConfirmed) {
//                             // Qui metti la logica per unire la chiave
//                             Swal.fire({
//                                 title: "Seleziona Associazione",
//                                 text: "Seleziona una associazione da unire.",
//                                 icon: "info"
//                             }).then(result => {
//                                 if (result.isConfirmed) {
//                                     let handlerRel = (event) => {
//                                         relationships.forEach(element => {
//                                             if (element.rhombus._id == event.target._id) {
//                                                 entity.Composed.rel = element
//                                                 // console.log(entity.Composed)
//                                                 entity.composedKeyRel = true
//                                                 Swal.fire({
//                                                     "title":"Collegamento Associazione Avvenuta",
//                                                     "icon":"success"
//                                                 })
//                                                 return
//                                             }
//                                             stage.off("click tap", handlerRel);
//                                         });

//                                     }
//                                     stage.on("click tap", handlerRel);
//                                 } else {
//                                     Swal.fire({
//                                         title: "Errore",
//                                         text: "Errore durante il collegamento!",
//                                         icon: "error"
//                                     })
//                                 }
//                             })
//                         }
//                     });
//                 }

//                 layer.add(attr.line);
//                 layer.add(attr.circle);
//                 layer.add(attr.text);
//             } else if (targetRel) {
//                 const attr = {
//                     circle: new Konva.Circle({
//                         radius: 5,
//                         fill: isPrimaryKey ? "#333" : "#fff",
//                         stroke: "#333",
//                         strokeWidth: 5,
//                         draggable: true,
//                     }),
//                     text: new Konva.Text({
//                         text: attrName,
//                         fontSize: 14,
//                         fontFamily: "Arial",
//                         fill: "#333",
//                         fontStyle: isPrimaryKey ? "bold" : "normal",
//                         padding: 5,
//                         listening: false,
//                     }),
//                     line: new Konva.Line({
//                         stroke: "#333",
//                         strokeWidth: 2,
//                         draggable: false,
//                     }),
//                     isPrimaryKey: isPrimaryKey,
//                 };

//                 // Posiziona l'attributo inizialmente in una posizione fissa attorno al rombo
//                 const relCenter = targetRel.rhombus.position();
//                 let initialAngle = (targetRel.attributies.length * 40) % 270; // angolo iniziale
//                 const radius = 40;

//                 // Utilizza la funzione per ottenere il punto sul bordo del rombo in base all’angolo
//                 const edgePoint = getRhombusEdgePoint(
//                     targetRel.rhombus,
//                     initialAngle,
//                     relCenter
//                 );

//                 // Posiziona il cerchio partendo dal bordo del rombo + un offset
//                 attr.circle.position({
//                     x: edgePoint.x + radius * Math.cos((initialAngle * Math.PI) / 180),
//                     y: edgePoint.y + radius * Math.sin((initialAngle * Math.PI) / 180),
//                 });

//                 // Posiziona il testo relativo al rombo, aggiustandolo in base alla direzione
//                 attr.text.position({
//                     x:
//                         relCenter.x +
//                         radius * Math.cos((initialAngle * Math.PI) / 180) +
//                         50,
//                     y:
//                         relCenter.y +
//                         radius * Math.sin((initialAngle * Math.PI) / 180) -
//                         attr.text.height() / 2,
//                 });

//                 // Collega l'attributo al rombo: la linea va dal bordo del rombo (edgePoint) al cerchio
//                 attr.line.points([
//                     edgePoint.x,
//                     edgePoint.y,
//                     attr.circle.x(),
//                     attr.circle.y(),
//                 ]);

//                 // Funzione helper migliorata per ottenere il punto di contatto sul bordo del rombo
//                 function getRhombusEdgePoint(rhombus, angle, center) {
//                     const rot = rhombus.rotation(); // Rotazione
//                     const scaleX = rhombus.scaleX(); // Scala X
//                     const scaleY = rhombus.scaleY(); // Scala Y
//                     const width = rhombus.width() * scaleX; // Larghezza del rombo
//                     const height = rhombus.height() * scaleY; // Altezza del rombo

//                     // Converti l'angolo in radianti e aggiungi la rotazione
//                     const rad = ((angle + rot) * Math.PI) / 180;

//                     // Calcola la distanza dal centro al bordo del rombo lungo l'angolo
//                     const rx = width / 2;
//                     const ry = height / 2;

//                     // Calcola il punto lungo il bordo esattamente
//                     const x = center.x + rx * Math.cos(rad);
//                     const y = center.y + ry * Math.sin(rad);

//                     return { x, y };
//                 }

//                 // Gestione del drag per l'attributo: aggiorna dinamicamente la posizione della linea e del testo
//                 attr.circle.on("dragmove", () => {
//                     const relCenter = targetRel.rhombus.position();
//                     const dx = attr.circle.x() - relCenter.x;
//                     const dy = attr.circle.y() - relCenter.y;
//                     let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
//                     if (angle < 0) angle += 360;

//                     // Calcola il punto sul bordo del rombo in tempo reale
//                     const newEdgePoint = getRhombusEdgePoint(
//                         targetRel.rhombus,
//                         angle,
//                         relCenter
//                     );

//                     lineAttribute = getLineData(
//                         { x: relCenter.x, y: relCenter.y },
//                         { x: attr.circle.x(), y: attr.circle.y() }
//                     );

//                     let firstPoint, secondPoint;

//                     // Determina la posizione della retta in base alla posizione dell'attributo
//                     if (lineAttribute.secondPoint.x - relCenter.x > 0) {
//                         if (lineAttribute.secondPoint.y - relCenter.y < 0) {
//                             /* ALTO-DESTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y -
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: targetRel.rhombus.radius() + relCenter.x,
//                                 y: relCenter.y,
//                             };
//                         } else {
//                             /* BASSO-DESTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y +
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: targetRel.rhombus.radius() + relCenter.x,
//                                 y: relCenter.y,
//                             };
//                         }
//                     } else {
//                         if (lineAttribute.secondPoint.y - relCenter.y < 0) {
//                             /* ALTO-SINISTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y -
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: relCenter.x - targetRel.rhombus.radius(),
//                                 y: relCenter.y,
//                             };
//                         } else {
//                             /* BASSO-SINISTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y +
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: relCenter.x - targetRel.rhombus.radius(),
//                                 y: relCenter.y,
//                             };
//                         }
//                     }

//                     // Calcola l'equazione della retta del rombo
//                     lineRhombus = getLineData(firstPoint, secondPoint);

//                     // Trova il punto di intersezione tra le due rette
//                     let X =
//                         (lineRhombus.q - lineAttribute.q) /
//                         (lineAttribute.m - lineRhombus.m);
//                     let Y = lineRhombus.m * X + lineRhombus.q;

//                     let NewEdgePointRight = {
//                         x: X,
//                         y: Y,
//                     };

//                     // Aggiorna la linea in modo che parta sempre dal bordo del rombo
//                     attr.line.points([
//                         NewEdgePointRight.x,
//                         NewEdgePointRight.y,
//                         attr.circle.x(),
//                         attr.circle.y(),
//                     ]);

//                     // Posiziona il testo: se il cerchio è a sinistra del rombo, posizionalo a sinistra, altrimenti a destra
//                     attr.text.position({
//                         x: attr.circle.x() + (dx < 0 ? -attr.text.width() - 10 : 10),
//                         y: attr.circle.y() - attr.text.height() / 2,
//                     });

//                     layer.batchDraw();
//                 });

//                 attr.text.on("dragmove", (e) => {
//                     attr.attached = true;
//                     updatePosition();
//                     layer.batchDraw();
//                 });
//                 attr.circle.on("dragend", () => {
//                     // Centro del rombo
//                     const relCenter = targetRel.rhombus.position();

//                     // Calcola l'angolo corrente (in gradi) tra il centro del rombo e il cerchio
//                     const dx = attr.circle.x() - relCenter.x;
//                     const dy = attr.circle.y() - relCenter.y;
//                     let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
//                     if (angle < 0) angle += 360;

//                     // Calcola gli angoli dei centri dei lati tenendo conto della rotazione del rombo
//                     // Ad esempio, per un rombo non ruotato i centri sarebbero a 0, 90, 180, 270,
//                     // ma se il rombo ha una rotazione 'r', i centri saranno a (r+45, r+135, r+225, r+315)
//                     let r = targetRel.rhombus.rotation();
//                     // Imposta i candidate: se vuoi i centri dei lati per un rombo ruotato di 45° usa [45, 135, 225, 315]
//                     // Se il rombo non è ruotato, puoi usare [0, 90, 180, 270]. Qui usiamo l'approccio con offset 45.
//                     let candidateAngles = [45, 135, 225, 315].map((a) => (a + r) % 360);

//                     // Trova l'angolo candidato più vicino a quello calcolato
//                     let snapAngle = candidateAngles.reduce((prev, curr) => {
//                         return Math.abs(angle - curr) < Math.abs(angle - prev)
//                             ? curr
//                             : prev;
//                     });

//                     // Usa la funzione helper per ottenere il punto esatto sul bordo del rombo,
//                     // considerando lo snapAngle e il centro del rombo
//                     const newEdgePoint = getRhombusEdgePoint(
//                         targetRel.rhombus,
//                         snapAngle,
//                         relCenter
//                     );

//                     const snapDistance = 40; // distanza desiderata dal bordo del rombo
//                     // Aggiorna la posizione del cerchio (attributo) usando lo snapAngle
//                     attr.circle.position({
//                         x:
//                             newEdgePoint.x +
//                             snapDistance * Math.cos((snapAngle * Math.PI) / 180),
//                         y:
//                             newEdgePoint.y +
//                             snapDistance * Math.sin((snapAngle * Math.PI) / 180),
//                     });

//                     let firstPoint, secondPoint;

//                     // Determina la posizione della retta in base alla posizione dell'attributo
//                     if (lineAttribute.secondPoint.x - relCenter.x > 0) {
//                         if (lineAttribute.secondPoint.y - relCenter.y < 0) {
//                             /* ALTO-DESTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y -
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: targetRel.rhombus.radius() + relCenter.x,
//                                 y: relCenter.y,
//                             };
//                         } else {
//                             /* BASSO-DESTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y +
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: targetRel.rhombus.radius() + relCenter.x,
//                                 y: relCenter.y,
//                             };
//                         }
//                     } else {
//                         if (lineAttribute.secondPoint.y - relCenter.y < 0) {
//                             /* ALTO-SINISTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y -
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: relCenter.x - targetRel.rhombus.radius(),
//                                 y: relCenter.y,
//                             };
//                         } else {
//                             /* BASSO-SINISTRA */
//                             firstPoint = {
//                                 x: relCenter.x,
//                                 y:
//                                     relCenter.y +
//                                     targetRel.rhombus.radius() * targetRel.rhombus.scaleY(),
//                             };
//                             secondPoint = {
//                                 x: relCenter.x - targetRel.rhombus.radius(),
//                                 y: relCenter.y,
//                             };
//                         }
//                     }

//                     // Calcola l'equazione della retta del rombo
//                     lineRhombus = getLineData(firstPoint, secondPoint);

//                     // Trova il punto di intersezione tra le due rette
//                     let X =
//                         (lineRhombus.q - lineAttribute.q) /
//                         (lineAttribute.m - lineRhombus.m);
//                     let Y = lineRhombus.m * X + lineRhombus.q;

//                     let NewEdgePointRight = {
//                         x: X,
//                         y: Y,
//                     };

//                     // Aggiorna la linea in modo che parta sempre dal bordo del rombo
//                     attr.line.points([
//                         NewEdgePointRight.x,
//                         NewEdgePointRight.y,
//                         attr.circle.x(),
//                         attr.circle.y(),
//                     ]);

//                     // Posiziona il testo: qui puoi adattare l'offset a destra/sinistra in base alla direzione
//                     attr.text.position({
//                         x: attr.circle.x() + (dx < 0 ? -attr.text.width() - 10 : 10),
//                         y: attr.circle.y() - attr.text.height() / 2,
//                     });

//                     layer.batchDraw();
//                 });

//                 // Doppio click per modificare l'attributo (eventuale)
//                 attr.circle.on("dblclick", () => {
//                     showAttributeModal(
//                         (newName, newPrimaryKey) => {
//                             attr.text.text(newName);
//                             attr.text.fontStyle(newPrimaryKey ? "bold" : "normal");
//                             attr.circle.fill(newPrimaryKey ? "#333" : "#fff");
//                             attr.isPrimaryKey = newPrimaryKey;
//                             layer.batchDraw();
//                         },
//                         attr.text.text(),
//                         attr.isPrimaryKey,
//                         attr
//                     );
//                 });

//                 targetRel.attributies.push(attr);
//                 layer.add(attr.line);
//                 layer.add(attr.circle);
//                 layer.add(attr.text);
//                 layer.batchDraw();
//             }

//             layer.batchDraw();
//         },
//             "",
//             false,
//         );

//         stage.off("click tap", handler);
//     };
//     stage.on("click tap", handler);
// }





// function createRelationship() {
//     // Verifica che ci siano almeno 2 entità sul canvas
//     if (entities.length < 2) {
//         Swal.fire({
//             icon: "warning",
//             title: "Entità insufficienti!",
//             text: "Devi avere almeno 2 entità per creare una relazione.",
//             confirmButtonText: "Ok"
//         });
//         return;
//     }

//     relationMode = true;
//     let selectedEntities = [];
//     const minEntities = 2;
//     const maxEntities = 4;

//     Swal.fire({
//         icon: "info",
//         title: "Seleziona entità",
//         text: `Clicca su almeno ${minEntities} e fino a ${maxEntities} entità. Premi Escape per confermare la selezione.`,
//         confirmButtonText: "Ok"
//     });

//     // Gestore per il click/tap sulle entità
//     const clickHandler = (e) => {
//         // Trova l'entità corrispondente all'elemento cliccato
//         const targetEntity = entities.find(entity => entity.rect === e.target);
//         if (targetEntity && !selectedEntities.includes(targetEntity)) {
//             selectedEntities.push(targetEntity);
//             // Evidenzia l'entità selezionata
//             targetEntity.rect.stroke("#4CAF50");
//             // Se si raggiunge il numero massimo, conferma automaticamente la selezione
//             if (selectedEntities.length === maxEntities) {

//                 showRelationModal(...selectedEntities);
//                 cleanupSelection();
//             }
//         }
//     };

//     // Rimuove i listener quando la selezione è terminata
//     const cleanupSelection = () => {
//         relationMode = false;
//         stage.off("click tap", clickHandler);
//         window.removeEventListener("keydown", keydownHandler);
//         selectedEntities.forEach(element => {
//             element.rect.stroke('#333')
//         });
//     };

//     // Gestore per il tasto Escape: conferma la selezione se sono state selezionate almeno minEntities
//     const keydownHandler = (event) => {
//         if (event.key === "Escape") {
//             if (selectedEntities.length >= minEntities) {
//                 showRelationModal(...selectedEntities);

//                 cleanupSelection();
//             } else {
//                 Swal.fire({
//                     icon: "warning",
//                     title: "Selezione incompleta",
//                     text: `Devi selezionare almeno ${minEntities} entità.`,
//                     confirmButtonText: "Ok"
//                 });
//             }
//         }
//     };

//     stage.on("click tap", clickHandler);
//     window.addEventListener("keydown", keydownHandler);
// }

// /**
//  * Mostra il modale per inserire il nome della relazione e le cardinalità.
//  * Vengono mostrate (e ripulite) tante "card" quanti sono gli oggetti entità passati.
//  */
// function showRelationModal(...entities) {
//     const relationModal = document.getElementById("relationModal");
//     relationModal.classList.add("active");

//     // Mostra solo le card corrispondenti alle entità selezionate
//     const cards = document.querySelectorAll('.card');
//     cards.forEach((card, index) => {
//         if (index < entities.length) {
//             card.style.display = "block";
//             card.innerText = entities[index].name || `Entità ${index + 1}`;
//         } else {
//             card.style.display = "none";
//         }
//     });

//     // Ripristina i campi del modale
//     document.getElementById("relNameInput").value = "";
//     // Supporto fino a 4 entità: resetta tutti i campi di cardinalità
//     const cardinalFields = ["card1Input", "card2Input", "card3Input", "card4Input"];
//     cardinalFields.forEach(field => {
//         document.getElementById(field).value = "";
//     });

//     // Rimuove eventuali listener precedenti sul pulsante di conferma
//     const confirmBtn = document.getElementById("confirmRelationBtn");
//     confirmBtn.onclick = () => {
//         const relName = document.getElementById("relNameInput").value.trim();
//         if (!relName) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Campo relazione mancante!",
//                 text: "Compila il nome della relazione.",
//                 confirmButtonText: "Ok"
//             });
//             return;
//         }

//         let cardValues = [];
//         // Per ciascuna entità selezionata, verifica il campo di cardinalità corrispondente
//         for (let i = 0; i < entities.length; i++) {
//             const cardInput = document.getElementById(`card${i + 1}Input`);
//             const cardValue = cardInput.value.trim();
//             if (!cardValue) {
//                 Swal.fire({
//                     icon: "warning",
//                     title: "Campo mancante!",
//                     text: `Compila il campo per la cardinalità dell'entità ${i + 1}.`,
//                     confirmButtonText: "Ok"
//                 });
//                 return;
//             }
//             if (!checkCardinals(cardValue)) {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Formato non valido!",
//                     text: `La cardinalità per l'entità ${i + 1} non è nel formato corretto.`,
//                     confirmButtonText: "Riprova"
//                 });
//                 return;
//             }
//             cardValues.push(cardValue);
//         }

//         // Crea la connessione passandogli le entità selezionate, il nome della relazione e le cardinalità
//         createConnection(entities, relName, cardValues);

//         Swal.fire({
//             icon: "success",
//             title: "Relazione creata!",
//             text: `La relazione "${relName}" è stata aggiunta con successo.`,
//             confirmButtonText: "Fantastico!"
//         });

//         // Chiude il modale
//         relationModal.classList.remove("active");
//     };
// }
// /**
//  * Verifica che il formato della cardinalità sia corretto.
//  * Il formato atteso è "min, max" (ad esempio "1, N" oppure "0, 1").
//  */
// function checkCardinals(card) {
//     const parts = card.split(",");
//     if (parts.length !== 2) return false;
//     const cMin = parts[0].trim().toUpperCase();
//     const cMax = parts[1].trim().toUpperCase();

//     const isValidValue = (val) => {
//         if (val === "N") return true;
//         return /^(0|[1-9]\d*)$/.test(val);
//     };

//     if (!isValidValue(cMin) || !isValidValue(cMax)) return false;
//     const numMin = cMin === "N" ? Infinity : parseInt(cMin, 10);
//     const numMax = cMax === "N" ? Infinity : parseInt(cMax, 10);

//     // Impedisci valori totalmente illogici (ad es. 0,0 o N,N)
//     if ((cMin === "0" && cMax === "0") || (cMin === "N" && cMax === "N")) return false;
//     if (numMin > numMax) return false;
//     if (cMin === "N" && cMax !== "N") return false;

//     return true;
// }


// /*
//  ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗
// ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
// ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║
// ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║
// ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║
//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                                                                   
// */

// function createConnection(entities, relName, cardValues) {
//     const rhombusWidth = 100;
//     const relationship = {
//         lines: entities.map(() => new Konva.Line({
//             stroke: "#333",
//             strokeWidth: 2,
//             lineCap: "round"
//         })),
//         rhombus: new Konva.RegularPolygon({
//             sides: 4,
//             radius: rhombusWidth / 2,
//             fill: "#fff",
//             stroke: "#333",
//             strokeWidth: 2,
//             draggable: true,
//             scaleY: 0.7
//         }),
//         text: new Konva.Text({
//             text: `${relName}`,
//             fontSize: 12,
//             fill: "#333",
//             listening: false
//         }),
//         entities: entities,
//         cards: cardValues.map((card, i) => new Konva.Text({
//             text: `(${card})`,
//             fontSize: 12,
//             fill: "#333",
//             // La posizione verrà aggiornata successivamente
//         })),
//         attributies: [],
//         ID: relationshipID++, // si assume che relationshipID sia definito globalmente
//         cornersEntity: {
//             top: null,
//             bottom: null,
//             left: null,
//             right: null
//         }
//     };

//     let AvgX = 0
//     let AvgY = 0
//     relationship.entities.forEach(el => {
//         AvgX += el.rect.x()
//         AvgY += el.rect.y()
//     })

//     AvgX = AvgX / relationship.entities.length
//     AvgY = AvgY / relationship.entities.length

//     relationship.rhombus.x(AvgX)
//     relationship.rhombus.y(AvgY)

//     // Aggiunge tutti gli elementi al layer
//     relationship.lines.forEach(line => layer.add(line));
//     layer.add(relationship.rhombus);
//     relationship.cards.forEach(card => layer.add(card));
//     layer.add(relationship.text);

//     relationships.push(relationship);
//     updateAllConnections();
//     relationship.rhombus.on("dblclick", () => showNameModal(relationship.text));
//     relationship.rhombus.on("dragmove", updateAllConnections)
// }


// /**
//  * Calcola il centro (centroide) fra le entità per posizionare il rombo.
//  */
// function calculateCentroid(entities) {
//     const sum = entities.reduce((acc, e) => ({
//         x: acc.x + e.rect.x() + e.rect.width() / 2,
//         y: acc.y + e.rect.y() + e.rect.height() / 2
//     }), { x: 0, y: 0 });

//     return {
//         x: sum.x / entities.length,
//         y: sum.y / entities.length
//     };
// }
// /*
// ██╗███████╗       █████╗    
// ██║██╔════╝      ██╔══██╗    
// ██║███████╗█████╗███████║    
// ██║╚════██║╚════╝██╔══██║    
// ██║███████║      ██║  ██║    
// ╚═╝╚══════╝      ╚═╝  ╚═╝    
// */

// let isaMode = false;
// let isaChildren = [];
// let isaRelations = [];
// let IDisa = 0;

// function createISA() {
//     if (entities.length < 1) {

//         Swal.fire({
//             "title": "Errore",
//             "text": "Devono esserci prima 2 entità",
//             "icon": "warning"
//         })
//         return;
//     }
//     isaMode = true;
//     let isaParent = null;
//     isaChildren = [];
//     Swal.fire({
//         "title": "Creazione IS-A",
//         "text": "Seleziona un'entità padre",
//         "icon": "info"
//     })

//     const handler = (e) => {
//         const target = entities.find((entity) => entity.rect === e.target);
//         if (target) {
//             isaParent = target;

//             target.rect.stroke("#4CAF50");

//             showISAModal(isaParent);

//             stage.off("click tap", handler);
//             layer.batchDraw();
//         }
//     };

//     stage.on("click tap", handler);
// }

// function showISAModal(parent) {
//     const modal = document.getElementById("isaModal");
//     const inputs = modal.querySelector(".isa-inputs");
//     inputs.innerHTML =
//         '<input type="text" placeholder="Nome figlio 1" required> <input type="text" placeholder="Nome figlio 2" required autocomplete="off">';
//     modal.classList.add("active");

//     document.getElementById("addChildBtn").onclick = () => {
//         if (modal.querySelectorAll("input").length < 5) {
//             const newInput = document.createElement("input");
//             newInput.type = "text";
//             newInput.autocomplete = "off";
//             newInput.placeholder = `Nome figlio ${inputs.children.length + 1}`;
//             newInput.required = true;
//             inputs.appendChild(newInput);
//         } else {
//             Swal.fire({
//                 "title": "Errore",
//                 "text": "Non puoi inserire più di 5 entità figlie",
//                 "icon": "error"
//             })
//         }
//     };

//     document.getElementById("confirmISABtn").onclick = () => {
//         const childNames = Array.from(inputs.children)
//             .map((input) => input.value.trim())
//             .filter(Boolean);

//         if (childNames.length < 2) {
//             Swal.fire({
//                 "title": "Errore",
//                 "text": "Inserisci almeno due figlio!",
//                 "icon": "error"
//             })
//             return;
//         }

//         const constraints = {
//             total: document.getElementById("totalPartial").value,
//             exclusivity: document.getElementById("exclusiveOverlap").value,
//         };

//         createISAHierarchy(childNames, constraints, parent);
//         modal.classList.remove("active");
//         parent.rect.stroke("#333");
//         layer.batchDraw();
//     };
// }


// function createISAHierarchy(childNames, constraints, parent) {
//     const children = [];
//     const parentCenter = {
//         x: parent.rect.x() + parent.rect.width() / 2,
//         y: parent.rect.y() + parent.rect.height() / 2,
//     };

//     // Crea entità figlie
//     childNames.forEach((name, i) => {
//         let entityTMP = createEntity(
//             parentCenter.x - 60 + i * 150,
//             parentCenter.y + 100
//         );
//         entityTMP.text.text(name);
//         entityTMP.isChildren = true;
//         children.push(entityTMP)
//     });

//     // Crea elementi della gerarchia
//     const isaGroup = {
//         id: Date.now(), // Identificatore univoco
//         parent: parent,
//         children: children,
//         lines: [],
//         connector: null,
//         labels: null,
//         update: function () {
//             // Funzioni helper per calcolare coseno e seno dell'angolo della freccia
//             function calcolaCosenoFreccia(arrowPoints) {
//                 const dx = arrowPoints[2] - arrowPoints[0];
//                 const dy = arrowPoints[3] - arrowPoints[1];
//                 const lunghezza = Math.sqrt(dx * dx + dy * dy);
//                 return lunghezza === 0 ? 0 : dx / lunghezza;
//             }
//             function calcolaSenoFreccia(arrowPoints) {
//                 const dx = arrowPoints[2] - arrowPoints[0];
//                 const dy = arrowPoints[3] - arrowPoints[1];
//                 const lunghezza = Math.sqrt(dx * dx + dy * dy);
//                 return lunghezza === 0 ? 0 : dy / lunghezza;
//             }

//             // Calcola i punti di connessione per i figli (centro orizzontale del rettangolo)
//             const childPoints = children.map(child => ({
//                 x: child.rect.x() + child.rect.width() / 2,
//                 y: child.rect.y()
//             }));


//             // Determina il range orizzontale dei figli e la posizione della linea orizzontale
//             const minX = Math.min(...childPoints.map(p => p.x));
//             const maxX = Math.max(...childPoints.map(p => p.x));

//             const minY = Math.min(...childPoints.map(p => p.y));
//             const maxY = Math.max(...childPoints.map(p => p.y));

//             let connectorY = childPoints[0].y - 40;

//             const arrowCenter = {
//                 x: (minX + maxX) / 2,
//                 y: (minY + maxY) / 2
//             };


//             // Imposta la linea orizzontale (connettore)
//             this.connector.points([minX, connectorY, maxX, connectorY]);

//             // Imposta inizialmente la freccia con punti base
//             this.arrow.points([
//                 arrowCenter.x,
//                 arrowCenter.y,
//                 parent.rect.x() + parent.rect.width() / 2,
//                 parent.rect.y() + parent.rect.height()
//             ]);

//             // Calcola coseno e seno della freccia
//             const cosenoAngolo = calcolaCosenoFreccia(this.arrow.points());
//             const senoAngolo = calcolaSenoFreccia(this.arrow.points());

//             // Ricrea le linee per ogni figlio (assicurandosi di partire da una lista vuota)
//             // this.lines = [];
//             this.lines.forEach(element => {
//                 element.destroy()
//             });
//             this.lines = []

//             children.forEach(() => {
//                 let lineTMP = new Konva.Line({
//                     stroke: "#333",
//                     strokeWidth: 2,
//                     lineCap: "round"
//                 })
//                 this.lines.push(lineTMP);
//                 layer.add(lineTMP)
//             });

//             // Posiziona l'etichetta vicino al connettore
//             let labelX = minX + 20;
//             let labelY = connectorY - 25;

//             // Se l'orientamento è prevalentemente verticale (|coseno| < 0.7)
//             // Se la freccia è più verticale (coseno vicino a 0)
//             if (Math.abs(cosenoAngolo) < 0.8) {
//                 let offset = 0
//                 if (senoAngolo < 0) {
//                     // Se il seno è negativo, la freccia punta verso il basso
//                     this.arrow.points([
//                         arrowCenter.x,
//                         connectorY,
//                         parent.rect.x() + parent.rect.width() / 2,
//                         parent.rect.y() + parent.rect.height()
//                     ]);
//                 } else {
//                     offset = 60
//                     connectorY = childPoints[0].y + 100;
//                     this.connector.points([minX, connectorY, maxX, connectorY]);
//                     labelY = connectorY + 10
//                     // Se il seno è positivo, la freccia punta verso l'alto
//                     this.arrow.points([
//                         arrowCenter.x,
//                         connectorY,
//                         parent.rect.x() + parent.rect.width() / 2,
//                         parent.rect.y()
//                     ]);
//                 }
//                 // Se la freccia è verticale, crea le linee verticali per collegare i figli
//                 this.lines.forEach((line, i) => {
//                     line.points([
//                         childPoints[i].x,
//                         childPoints[i].y + offset,
//                         childPoints[i].x,
//                         connectorY
//                     ]);
//                 });

//             } else {

//                 let offset = 0
//                 let connectorX = 0;

//                 // Se la freccia è più orizzontale (coseno vicino a ±1)
//                 if (cosenoAngolo > 0) {

//                     //DESTRO

//                     // Se il seno è negativo, la freccia punta verso sinistra
//                     connectorX = childPoints[0].x + 100;
//                     this.arrow.points([
//                         childPoints[0].x + 100,
//                         arrowCenter.y,
//                         parent.rect.x(),
//                         parent.rect.y() + parent.rect.height() / 2
//                     ]);

//                     offset = 62

//                     this.connector.points([connectorX, minY + 30, connectorX, maxY + 30]);

//                     labelX = connectorX - 15
//                 } else {

//                     //SINISTRA

//                     // Se il seno è positivo, la freccia punta verso destra
//                     connectorX = childPoints[0].x - 100;
//                     this.arrow.points([
//                         connectorX,
//                         arrowCenter.y,
//                         parent.rect.x() + parent.rect.width(),
//                         parent.rect.y() + parent.rect.height() / 2
//                     ]);
//                     offset = -62
//                     this.connector.points([connectorX, minY + 30, connectorX, maxY + 30]);

//                     labelX = connectorX
//                 }
//                 this.lines.forEach((line, i) => {
//                     line.points([
//                         childPoints[i].x + offset,
//                         childPoints[i].y + 30,
//                         this.connector.points()[2],
//                         childPoints[i].y + 30,
//                     ]);
//                 });
//                 labelY = minY
//             }

//             this.label.position({ x: labelX, y: labelY });

//             // Imposta il flag del padre
//             parent.isParent = true;

//         }

//     };

//     isaGroup.connector = new Konva.Line({
//         stroke: "#333",
//         strokeWidth: 2,
//     });

//     isaGroup.arrow = new Konva.Arrow({
//         pointerLength: 10,
//         pointerWidth: 10,
//         stroke: "#333",
//         fill: "#fff",
//     });

//     isaGroup.label = new Konva.Text({
//         text: `(${constraints.total}, ${constraints.exclusivity})`.toUpperCase(),
//         fontSize: 14,
//         fontFamily: "Arial",
//         fill: "#333",
//     });

//     // Aggiungi al layer
//     isaGroup.lines.forEach((line) => layer.add(line));
//     layer.add(isaGroup.connector);
//     layer.add(isaGroup.arrow);
//     layer.add(isaGroup.label);

//     // Funzione di aggiornamento
//     const updateHandler = () => {
//         isaGroup.update();
//         layer.batchDraw();
//     };

//     // Aggiungi listener per il trascinamento
//     children.forEach((child) => {
//         child.rect.on("dragmove", updateHandler);
//     });
//     parent.rect.on("dragmove", updateHandler);
//     isaRelations.push(isaGroup);
//     updateHandler();
// }

// /*
// ██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗   ██╗
// ██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝╚██╗ ██╔╝
// ██║   ██║   ██║   ██║██║     ██║   ██║    ╚████╔╝
// ██║   ██║   ██║   ██║██║     ██║   ██║     ╚██╔╝  
// ╚██████╔╝   ██║   ██║███████╗██║   ██║      ██║  
//  ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝      ╚═╝  
// */
// function selection(object) {
//     if (object.rect != null) {
//         if (selected == object) {
//             selected.rect.stroke("#333");
//             selected = null;
//         } else {
//             selected = object;
//             selected.rect.stroke("#2196F3");
//         }
//     } else {
//         if (object.rhombus != null) {
//             if (selected == object) {
//                 selected.rhombus.stroke("#333");
//                 selected = null;
//             } else {
//                 selected = object;
//                 selected.rhombus.stroke("#2196F3");
//             }
//         }
//     }
//     layer.batchDraw();
// }

// function showNameModal(textNode) {
//     const nameModal = document.getElementById("nameModal");
//     const input = document.getElementById("nameInput"); // Aggiungi questa linea
//     input.value = textNode.text();
//     nameModal.classList.add("active");

//     document.getElementById("confirmNameBtn").onclick = () => {



//         if (input.value != "") {

//             tmpCheckNotUnique = entities.some(element => {
//                 return element.text.text().toLowerCase() == input.value.toLowerCase() && input.value.toLowerCase() != "Entità".toLowerCase();
//             });

//             if (tmpCheckNotUnique == false) {
//                 tmpCheckNotUnique = relationships.some(element => {
//                     return element.text.text().toLowerCase() == input.value.toLowerCase() && input.value.toLowerCase() != "Entità".toLowerCase();
//                 });

//             }
//             if (tmpCheckNotUnique) {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Nome non valido!",
//                     text: "Nome non unico!",
//                     confirmButtonText: "Riprova",
//                 });
//             } else {
//                 textNode.text(input.value); // Usa input invece di document.getElementById
//             }

//             nameModal.classList.remove("active");
//             layer.batchDraw();
//             return;
//         } else {

//             Swal.fire({
//                 icon: "error",
//                 title: "Nome non valido!",
//                 text: "Dovresti aggiungere del testo per il nome",
//                 confirmButtonText: "Riprova",
//             });
//         }
//     };
// }

// // Funzione per ottenere il punto d'intersezione fra il bordo dell'entità e la linea verso targetPoint
// function getEdgePoint(entity, targetPoint) {
//     const rect = entity.rect;
//     const centerX = rect.x() + rect.width() / 2;
//     const centerY = rect.y() + rect.height() / 2;

//     const dx = targetPoint.x - centerX;
//     const dy = targetPoint.y - centerY;

//     const ratio = Math.abs(dx / dy);
//     const halfWidth = rect.width() / 2;
//     const halfHeight = rect.height() / 2;

//     if (ratio > halfWidth / halfHeight) {
//         const signX = dx > 0 ? 1 : -1;
//         return {
//             x: centerX + signX * halfWidth,
//             y: centerY + (dy * halfWidth) / Math.abs(dx),
//         };
//     } else {
//         const signY = dy > 0 ? 1 : -1;
//         return {
//             x: centerX + (dx * halfHeight) / Math.abs(dy),
//             y: centerY + signY * halfHeight,
//         };
//     }
// }

// // ------------------------
// // Gestione dei Bottoni UI
// // ------------------------
// document.getElementById("createEntity").addEventListener("click", () => {
//     createEntity(
//         Math.random() * (stage.width() - 200),
//         Math.random() * (stage.height() - 100)
//     );
// });

// document.getElementById("addAttribute").addEventListener("click", addAttribute);
// document
//     .getElementById("createRelation")
//     .addEventListener("click", createRelationship);

// document.getElementById("zoomIn").addEventListener("click", () => {
//     stage.scale({ x: stage.scaleX() * 1.2, y: stage.scaleY() * 1.2 });
//     layer.batchDraw();
// });

// document.getElementById("zoomOut").addEventListener("click", () => {
//     stage.scale({ x: stage.scaleX() / 1.2, y: stage.scaleY() / 1.2 });
//     layer.batchDraw();
// });

// document.getElementById("saveImgBtn").addEventListener("click", () => {
//     // Crea un rettangolo bianco che copre l'intera area dello stage
//     const whiteBG = new Konva.Rect({
//         x: 0,
//         y: 0,
//         width: stage.width(),
//         height: stage.height(),
//         fill: "white",
//     });
//     // Aggiungi il rettangolo al layer e portalo in fondo agli altri oggetti
//     layer.add(whiteBG);
//     whiteBG.moveToBottom();
//     layer.batchDraw();

//     // Esporta lo stage in immagine
//     const dataURL = stage.toDataURL({ pixelRatio: 3 });

//     // Rimuovi il rettangolo bianco (così lo stage rimane com'era)
//     whiteBG.destroy();
//     layer.batchDraw();

//     // Crea un link per il download dell'immagine
//     const link = document.createElement("a");
//     link.download = "schema-er.png";
//     link.href = dataURL;
//     link.click();
// });

// document.getElementById("createISA").addEventListener("click", (event) => {
//     event.preventDefault();
//     createISA();
// });


// // Esportazione in JSON
// document.getElementById("saveJSONBtn").addEventListener("click", () => {
  
//     let json = stage.toJSON();
//     // json.
//     const blob = new Blob([json], { type: 'application/json' });
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(blob);
//     link.download = 'konva_scene.json';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// });

// document.getElementById("loadJSONBtn").addEventListener("click", () => {
  
//     function loadFromFile(event) {
//         const file = event.target.files[0];
//         if (!file) return;
    
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const json = e.target.result;
//             const newStage = Konva.Node.create(json, "container");

//             // Distrugge la scena precedente per evitare duplicati
//             stage.destroy();
//             stage = newStage;
        
//             console.log(stage.find("Rect"))

//             // Seleziona tutti i nodi e riaggiunge gli eventi
//             stage.find("Rect").forEach(node => {
//                 node.on("dblclick", () => showNameModal(node));
//                 node.on("dragmove", updateAllConnections);
//             });
        
//             stage.find("RegularPolygon").forEach(node => {
//                 node.on("dblclick", () => showNameModal(node));
//                 node.on("dragmove", updateAllConnections);
//             });
        
//             // Riapplica eventi di selezione sugli oggetti
//             stage.find("Rect, RegularPolygon").forEach(node => {
//                 node.on("click", () => selection(node));
//             });
        
//             layer.batchDraw();
//         };
//         reader.readAsText(file);
//     }
//     let fl = document.createElement('input')
//     document.body.append(fl)
//     fl.type = "file"
//     fl.accept = ".json"
//     fl.onchange = loadFromFile
//     fl.click()
    
// });


// document.getElementById("deleteBtn").addEventListener("click", () => {
//     stage.off("click tap"); // Rimuove eventuali eventi duplicati
//     // Aggiungi questo gestore di eventi alla fine di app.js
//     stage.on("click tap", (e) => {
//         // if (!e.evt.ctrlKey) return;

//         // Cerca entità
//         const targetEntity = entities.find(
//             (entity) => entity.rect === e.target || entity.text === e.target
//         );
//         if (targetEntity != null) {
//             targetEntity.resize.destroy()
//             targetEntity.attributes.forEach(element => {
//                 element.line.destroy()
//                 element.circle.destroy()
//                 element.text.destroy()
//             });
//         }
//         // Cerca relazioni
//         const targetRel = relationships.find(
//             (rel) => rel.rhombus === e.target || rel.text === e.target
//         );

//         if (targetEntity != null)
//             if (targetEntity.isParent != null && targetEntity.isParent == true) {
//                 cleanupISARelations();
//             }

//         let targetAttr;
//         // Cerca attributi delle relazioni
//         relationships.forEach((rel) => {
//             rel.attributies.forEach((attr) => {
//                 if (attr.circle === e.target || attr.text === e.target) {
//                     targetAttr = { rel, attr };
//                 }
//             });
//         });
//         if(targetEntity){
//             relationships.forEach(element => {
    
//                 let index = element.entities.findIndex(ent => ent.rect._id === targetEntity.rect._id);
    
//                 if (index != -1) {
//                     element.entities.splice(index, 1)
//                     element.lines[index].destroy()
//                     element.lines.splice(index, 1)
//                     element.cards[index].destroy()
//                     element.cards.splice(index, 1)
//                 }
    
//                 if (element.entities.length <= 1) {
//                     deleteRelationship(element)
//                 }
//             });
//         }


//         entities.forEach(entity => {
//             if (entity.attributes.length > 0) {
//                 targetAttr = entity.attributes.find(attr => attr.circle === e.target || attr.text === e.target) || targetAttr;
//             }
//         });

//         relationships.forEach(rel => {
//             targetAttr = rel.attributies.find(attr => attr.circle === e.target || attr.text === e.target) || targetAttr;
//         });


//         // Elimina elementi trovati
//         if (targetEntity) {
//             deleteEntity(targetEntity);
//         } else if (targetRel) {
//             deleteRelationship(targetRel);
//         } else if (targetAttr) {
//             targetAttr.circle.destroy()
//             targetAttr.text.destroy()
//             targetAttr.line.destroy()
//         }
//         stage.off("click tap");
//     });

//     function findParent(childEntity) {
//         const relation = isaRelations.find((isaGroup) =>
//             isaGroup.children.includes(childEntity)
//         );

//         return relation ? relation.parent : null;
//     }

//     function deleteEntity(entity) {
//         // Trova il padre
//         const parent = findParent(entity);
//         // Se l'entità è figlia di una IS-A, aggiorna la relazione
//         isaRelations = isaRelations.filter((isaGroup) => {
//             if (!isaGroup.children) return true; // Protezione contro undefined


//             if (isaGroup.children.includes(entity)) {
//                 // Rimuovi il figlio
//                 isaGroup.children = isaGroup.children.filter(
//                     (child) => child !== entity
//                 );


//                 // Se non ci sono più figli, rimuovi la relazione IS-A
//                 if (isaGroup.children.length === 0) {
//                     isaGroup.connector.destroy();
//                     isaGroup.arrow.destroy();
//                     isaGroup.label.destroy();
//                     isaGroup.lines.forEach((line) => line.destroy());
//                     return false; // Rimuovi la relazione dall'array globale
//                 }
//             }
//             return true;
//         });


//         // Elimina l'entità
//         entity.rect.destroy();
//         entity.text.destroy();
//         entities = entities.filter((e) => e !== entity);

//         // Aggiorna la scena
//         layer.batchDraw();
//     }

//     function deleteRelationship(rel) {
//         // Elimina gli attributi associati alla relazione
//         rel.attributies.forEach((attr) => {
//             attr.circle.destroy();
//             attr.text.destroy();
//             attr.line.destroy();
//         });

//         // Distruggi gli elementi della relazione
//         rel.lines.forEach(element => {
//             element.destroy()
//         });
//         // rel.line2.destroy();
//         rel.rhombus.destroy();
//         rel.text.destroy();
//         // rel.card1.destroy();
//         rel.cards.forEach(element => {
//             element.destroy()
//         });
//         // rel.card2.destroy();

//         // Rimuovi la relazione dall'array globale
//         relationships = relationships.filter((r) => r !== rel);

//         layer.batchDraw();
//     }

//     function deleteAttribute({ entity, attr, rel }) {
//         if (entity) {
//             entity.attributes = entity.attributes.filter((a) => a !== attr);
//         }
//         if (rel) {
//             rel.attributies = rel.attributies.filter((a) => a !== attr);
//         }
//         attr.circle.destroy();
//         attr.text.destroy();
//         attr.line.destroy();
//         layer.batchDraw();
//     }
// });

// function cleanupISARelations() {
//     isaRelations = isaRelations.filter((isaGroup) => {
//         // Verifica se il parent esiste ancora
//         const parentExists = entities.includes(isaGroup.parent);

//         // Verifica se tutti i children esistono ancora
//         const childrenExist = isaGroup.children.every((child) =>
//             entities.includes(child)
//         );

//         isaGroup.children.forEach((element) => {
//             element.rect.destroy();
//             element.text.destroy();
//             element.resize.destroy();
//         });

//         if (true) {
//             // Distruggi gli elementi grafici
//             isaGroup.lines.forEach((line) => line.destroy());
//             isaGroup.connector.destroy();
//             isaGroup.arrow.destroy();
//             isaGroup.label.destroy();
//             return false;
//         }

//         return true;
//     });
// }

// function showAttributeModal(
//     callback,
//     existingName = "",
//     existingPrimaryKey = false,
//     atribute
// ) {
//     const modal = document.getElementById("attributeModal");
//     const nameInput = document.getElementById("attrNameInput");
//     const primaryKeyCheckbox = document.getElementById("attrPrimaryKey");
//     const confirmBtn = document.getElementById("confirmAttributeBtn");

//     // Imposta i valori pre-esistenti (se in modifica)
//     nameInput.value = existingName;
//     primaryKeyCheckbox.checked = existingPrimaryKey;

//     // Mostra la modale
//     modal.classList.add("active");



//     // Puliamo i listener precedenti
//     confirmBtn.onclick = () => {
//         const attrName = nameInput.value.trim();
//         const isPrimaryKey = primaryKeyCheckbox.checked;
//         if (!attrName) {
//             Swal.fire({
//                 icon: "error",
//                 title: "Nome non valido!",
//                 text: "Il nome non è valido",
//                 confirmButtonText: "Riprova",
//             });
//             return;
//         }


//         let targetAttr = atribute;
//         let context = null; // Variabile per sapere dove si trova l'attributo

//         console.log(targetAttr)
//         // Cerca nelle entità
//         entities.forEach(entity => {
//             if (entity.attributes.length > 0) {
//                 let foundAttr = entity.attributes.find(attr => attr.circle === atribute || attr.text === atribute);
//                 if (foundAttr) {
//                     targetAttr = foundAttr;
//                     context = { type: "entity", reference: entity }; // Salva il contesto
//                 }
//             }
//         });

//         // Cerca nelle relazioni, se non è stato già trovato
//         if (!targetAttr) {
//             relationships.forEach(rel => {
//                 let foundAttr = rel.attributies.find(attr => attr.circle === atribute || attr.text === atribute);
//                 if (foundAttr) {
//                     targetAttr = foundAttr;
//                     context = { type: "relationship", reference: rel }; // Salva il contesto
//                 }
//             });
//         }

//         // Ora puoi usare `context` per sapere dove si trova l'attributo
//         if (context) {
//             console.log("Attributo trovato in:", context.type, "Riferimento:", context.reference);
//         } else {
//             console.log("Attributo non trovato");
//         }



//         if (true) {

//         }
//         modal.classList.remove("active");
//         if (nameInput.value.trim() != "") {
//             callback(attrName, isPrimaryKey);
//         }
//     };
// }

// function getConnectionPoint(entity, index, total) {
//     const rect = entity.rect;
//     const x = rect.x();
//     const y = rect.y();
//     const w = rect.width();
//     const h = rect.height();
//     const P = 2 * (w + h);
//     const d = ((index + 1) * P) / (total + 1);

//     let cx, cy;
//     if (d <= w) {
//         // Lato superiore
//         cx = x + d;
//         cy = y;
//     } else if (d <= w + h) {
//         // Lato destro
//         cx = x + w;
//         cy = y + (d - w);
//     } else if (d <= 2 * w + h) {
//         // Lato inferiore
//         cx = x + w - (d - (w + h));
//         cy = y + h;
//     } else {
//         // Lato sinistro
//         cx = x;
//         cy = y + h - (d - (2 * w + h));
//     }
//     return { x: cx, y: cy };
// }


// function duplicateEntity(entity) {
//     let targetEntity = entities.find((e) => e.rect._id == entity._id);
    
//     let rectTMP = createEntity(entity.attrs.x + 20, entity.attrs.y + 20)
//     rectTMP.rect.width(entity.width())
//     rectTMP.rect.height(entity.height())
    
//     entities.push(rectTMP);
//     return rectTMP;
// }

// let section = document.querySelector("section");
// let firstButtonOption = section.querySelectorAll("button")[0];
// firstButtonOption.addEventListener("click", (event) => {
//     event.preventDefault();

//     // Rimuove qualsiasi listener precedente per evitare duplicazioni
//     stage.off("click tap");

//     let handler = (e) => {
//         duplicateEntity(e.target);

//         // Dopo il primo click, rimuove il listener
//         stage.off("click tap", handler);
//     };

//     stage.on("click tap", handler);
// });

// function getLineData(firstPoint, secondPoint) {
//     return {
//         firstPoint: firstPoint,
//         secondPoint: secondPoint,
//         m: (secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x),
//         q:
//             firstPoint.y -
//             ((secondPoint.y - firstPoint.y) / (secondPoint.x - firstPoint.x)) *
//             firstPoint.x,
//     };
// }
// document.getElementById("resetView").addEventListener("click", () => {
//     stage.scale({ x: 1, y: 1 });
//     stage.position({ x: 0, y: 0 });
//     layer.batchDraw();
// });



// function getRectData(rect) {
//     return {
//         // 1. COORDINATE FONDAMENTALI
//         // --------------------------
//         // Angoli base
//         CORNER_TOP_LEFT: {
//             x: rect.x(),
//             y: rect.y()
//         },
//         CORNER_TOP_RIGHT: {
//             x: rect.x() + rect.width(),
//             y: rect.y()
//         },
//         CORNER_BOTTOM_RIGHT: {
//             x: rect.x() + rect.width(),
//             y: rect.y() + rect.height()
//         },
//         CORNER_BOTTOM_LEFT: {
//             x: rect.x(),
//             y: rect.y() + rect.height()
//         },

//         // Centro geometrico
//         RECT_CENTER: {
//             x: rect.x() + rect.width() / 2,
//             y: rect.y() + rect.height() / 2
//         },

//         // 2. PUNTI MEDI DEI LATI
//         // ----------------------
//         MID_TOP: {
//             x: rect.x() + rect.width() / 2,
//             y: rect.y()
//         },
//         MID_RIGHT: {
//             x: rect.x() + rect.width(),
//             y: rect.y() + rect.height() / 2
//         },
//         MID_BOTTOM: {
//             x: rect.x() + rect.width() / 2,
//             y: rect.y() + rect.height()
//         },
//         MID_LEFT: {
//             x: rect.x(),
//             y: rect.y() + rect.height() / 2
//         },

//         // 3. METADATI GEOMETRICI
//         // ----------------------
//         DIMENSIONS: {
//             width: rect.width(),
//             height: rect.height()
//         },
//         AREA: rect.width() * rect.height(),
//         PERIMETER: 2 * (rect.width() + rect.height()),
//         ASPECT_RATIO: rect.width() / rect.height(),

//         // 4. TRASFORMAZIONI
//         // -----------------
//         TRANSFORM: {
//             rotation: rect.rotation(),
//             scaleX: rect.scaleX(),
//             scaleY: rect.scaleY(),
//             skewX: rect.skewX(),
//             skewY: rect.skewY()
//         },

//         // 5. INFO VISUALI
//         // ---------------
//         STYLE: {
//             fill: rect.fill(),
//             stroke: rect.stroke(),
//             strokeWidth: rect.strokeWidth(),
//             opacity: rect.opacity()
//         },

//         // 6. UTILITIES PER COLLISIONI
//         // --------------------------
//         BOUNDING_BOX: {
//             top: rect.y(),
//             right: rect.x() + rect.width(),
//             bottom: rect.y() + rect.height(),
//             left: rect.x()
//         }
//     };
// }

// window.addEventListener('beforeunload', (event) => {
//     event.returnValue=""
// })


// window.addEventListener("load", (event) => {
//     Swal.fire({
//         title: "Tutorial per ER Diagram Tool",
//         text:"Vorresti seguire il tutorial per un utilizzo corretto al software",
//         showDenyButton: true,
//         confirmButtonText: "Segui",
//         denyButtonText: `Salta`
//       }).then((result) => {
//         if (result.isConfirmed) {
//             let a = document.createElement('a')
//             a.href="guide.html"
//             a.click()
//         } else if (result.isDenied) {
//           Swal.fire("", "Software pronto all'uso", "info");
//         }
//       });
// });