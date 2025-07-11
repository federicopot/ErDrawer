import { createEntity } from './entity.js'
import { addAttribute } from './attribute.js'
import { createRelationship } from './relations.js';
import { createISA } from './isa.js';

export let stage = new Konva.Stage({
    container: "container",
    width: window.innerWidth,
    height: window.innerHeight - 50,
    draggable: true,
});

stage.on("contextmenu", (e) => {
    e.evt.preventDefault();
});

window.addEventListener("resize", () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight - 50);
});

export let layer = new Konva.Layer();
stage.add(layer);

// Strutture dati
export let entities = [];
export let relationships = [];
export let relationshipID = 0;
export function setRelationshipID(value) {
    relationshipID = value;
}
export let selected = null;

export let relationMode = false;
export function setRelationMode(value) {
    relationMode = value;
}
export let firstRelationEntity = null;
export let pendingNameTarget = null;

export let isaMode = false;
export function setIsaMode(value){
    isaMode = value
}
export let isaChildren = [];
export function setIsaChildren (value){
    isaChildren = value
}
export let isaRelations = [];
export let IDisa = 0;
// /*
// ███████╗ ██████╗  ██████╗ ███╗   ███╗
// ╚══███╔╝██╔═══██╗██╔═══██╗████╗ ████║
//   ███╔╝ ██║   ██║██║   ██║██╔████╔██║
//  ███╔╝  ██║   ██║██║   ██║██║╚██╔╝██║
// ███████╗╚██████╔╝╚██████╔╝██║ ╚═╝ ██║
// ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝
// */

stage.on("wheel", (e) => {
    e.evt.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const delta = e.evt.deltaY > 0 ? 1 : -1;
    const newScale = Math.max(
        0.5,
        Math.min(4, delta < 0 ? oldScale * 1.2 : oldScale / 1.2)
    );

    const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    });
    layer.batchDraw();
});


/*
██╗   ██╗████████╗██╗██╗     ██╗████████╗██╗   ██╗
██║   ██║╚══██╔══╝██║██║     ██║╚══██╔══╝╚██╗ ██╔╝
██║   ██║   ██║   ██║██║     ██║   ██║    ╚████╔╝
██║   ██║   ██║   ██║██║     ██║   ██║     ╚██╔╝  
╚██████╔╝   ██║   ██║███████╗██║   ██║      ██║  
 ╚═════╝    ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝      ╚═╝  
*/

// ------------------------
// Gestione dei Bottoni UI
// ------------------------

document.getElementById("createEntity").addEventListener("click", () => {
    createEntity(
        Math.random() * (stage.width() - 200),
        Math.random() * (stage.height() - 100),
        layer
    );
});
document.getElementById("addAttribute").addEventListener("click", ()=>{
    addAttribute()
});


document.getElementById("createRelation").addEventListener("click", ()=>{
    createRelationship()
});

document.getElementById("zoomIn").addEventListener("click", () => {
    stage.scale({ x: stage.scaleX() * 1.2, y: stage.scaleY() * 1.2 });
    layer.batchDraw();
});

document.getElementById("zoomOut").addEventListener("click", () => {
    stage.scale({ x: stage.scaleX() / 1.2, y: stage.scaleY() / 1.2 });
    layer.batchDraw();
});
document.getElementById("createISA").addEventListener("click", (event) => {
    event.preventDefault();
    createISA();
});


// ------------------------
// Gestione del tutorial
// ------------------------


document.getElementById("saveImgBtn").addEventListener("click", () => {
    // Crea un rettangolo bianco che copre l'intera area dello stage
    const whiteBG = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: "white",
    });
    // Aggiungi il rettangolo al layer e portalo in fondo agli altri oggetti
    layer.add(whiteBG);
    whiteBG.moveToBottom();
    layer.batchDraw();

    // Esporta lo stage in immagine
    const dataURL = stage.toDataURL({ pixelRatio: 3 });

    // Rimuovi il rettangolo bianco (così lo stage rimane com'era)
    whiteBG.destroy();
    layer.batchDraw();

    // Crea un link per il download dell'immagine
    const link = document.createElement("a");
    link.download = "schema-er.png";
    link.href = dataURL;
    link.click();
});
document.getElementById("deleteBtn").addEventListener("click", () => {
    stage.off("click tap"); // Rimuove eventuali eventi duplicati
    // Aggiungi questo gestore di eventi alla fine di app.js
    stage.on("click tap", (e) => {
        // if (!e.evt.ctrlKey) return;

        // Cerca entità
        const targetEntity = entities.find(
            (entity) => entity.rect === e.target || entity.text === e.target
        );
        if (targetEntity != null) {
            targetEntity.resize.destroy()
            targetEntity.attributes.forEach(element => {
                element.line.destroy()
                element.circle.destroy()
                element.text.destroy()
            });
        }
        // Cerca relazioni
        const targetRel = relationships.find(
            (rel) => rel.rhombus === e.target || rel.text === e.target
        );

        if (targetEntity != null)
            if (targetEntity.isParent != null && targetEntity.isParent == true) {
                cleanupISARelations();
            }

        let targetAttr;
        // Cerca attributi delle relazioni
        relationships.forEach((rel) => {
            rel.attributes.forEach((attr) => {
                if (attr.circle === e.target || attr.text === e.target) {
                    targetAttr = { rel, attr };
                }
            });
        });
        if(targetEntity){
            relationships.forEach(element => {
    
                let index = element.entities.findIndex(ent => ent.rect._id === targetEntity.rect._id);
    
                if (index != -1) {
                    element.entities.splice(index, 1)
                    element.lines[index].destroy()
                    element.lines.splice(index, 1)
                    element.cards[index].destroy()
                    element.cards.splice(index, 1)
                }
    
                if (element.entities.length <= 1) {
                    deleteRelationship(element)
                }
            });
        }


        entities.forEach(entity => {
            if (entity.attributes.length > 0) {
                targetAttr = entity.attributes.find(attr => attr.circle === e.target || attr.text === e.target) || targetAttr;
            }
        });

        relationships.forEach(rel => {
            targetAttr = rel.attributes.find(attr => attr.circle === e.target || attr.text === e.target) || targetAttr;
        });


        // Elimina elementi trovati
        if (targetEntity) {
            deleteEntity(targetEntity);
        } else if (targetRel) {
            deleteRelationship(targetRel);
        } else if (targetAttr) {
            targetAttr.circle.destroy()
            targetAttr.text.destroy()
            targetAttr.line.destroy()
        }
        stage.off("click tap");
    });

    function findParent(childEntity) {
        const relation = isaRelations.find((isaGroup) =>
            isaGroup.children.includes(childEntity)
        );

        return relation ? relation.parent : null;
    }

    function deleteEntity(entity) {
        // Trova il padre
        const parent = findParent(entity);
        // Se l'entità è figlia di una IS-A, aggiorna la relazione
        isaRelations = isaRelations.filter((isaGroup) => {
            if (!isaGroup.children) return true; // Protezione contro undefined


            if (isaGroup.children.includes(entity)) {
                // Rimuovi il figlio
                isaGroup.children = isaGroup.children.filter(
                    (child) => child !== entity
                );


                // Se non ci sono più figli, rimuovi la relazione IS-A
                if (isaGroup.children.length === 0) {
                    isaGroup.connector.destroy();
                    isaGroup.arrow.destroy();
                    isaGroup.label.destroy();
                    isaGroup.lines.forEach((line) => line.destroy());
                    return false; // Rimuovi la relazione dall'array globale
                }
            }
            return true;
        });


        // Elimina l'entità
        entity.rect.destroy();
        entity.text.destroy();
        entities = entities.filter((e) => e !== entity);

        // Aggiorna la scena
        layer.batchDraw();
    }

    function deleteRelationship(rel) {
        // Elimina gli attributi associati alla relazione
        rel.attributes.forEach((attr) => {
            attr.circle.destroy();
            attr.text.destroy();
            attr.line.destroy();
        });

        // Distruggi gli elementi della relazione
        rel.lines.forEach(element => {
            element.destroy()
        });
        // rel.line2.destroy();
        rel.rhombus.destroy();
        rel.text.destroy();
        // rel.card1.destroy();
        rel.cards.forEach(element => {
            element.destroy()
        });
        // rel.card2.destroy();

        // Rimuovi la relazione dall'array globale
        relationships = relationships.filter((r) => r !== rel);

        layer.batchDraw();
    }

    function deleteAttribute({ entity, attr, rel }) {
        if (entity) {
            entity.attributes = entity.attributes.filter((a) => a !== attr);
        }
        if (rel) {
            rel.attributes = rel.attributes.filter((a) => a !== attr);
        }
        attr.circle.destroy();
        attr.text.destroy();
        attr.line.destroy();
        layer.batchDraw();
    }
});

function cleanupISARelations() {
    isaRelations = isaRelations.filter((isaGroup) => {
        // Verifica se il parent esiste ancora
        const parentExists = entities.includes(isaGroup.parent);

        // Verifica se tutti i children esistono ancora
        const childrenExist = isaGroup.children.every((child) =>
            entities.includes(child)
        );

        isaGroup.children.forEach((element) => {
            element.rect.destroy();
            element.text.destroy();
            element.resize.destroy();
        });

        if (true) {
            // Distruggi gli elementi grafici
            isaGroup.lines.forEach((line) => line.destroy());
            isaGroup.connector.destroy();
            isaGroup.arrow.destroy();
            isaGroup.label.destroy();
            return false;
        }

        return true;
    });
}

// ------------------------
// Gestione del tutorial
// ------------------------


window.addEventListener("load", (event) => {
    Swal.fire({
        title: "Tutorial per ER Diagram Tool",
        text:"Vorresti seguire il tutorial per un utilizzo corretto al software",
        showDenyButton: true,
        confirmButtonText: "Segui",
        denyButtonText: `Salta`
      }).then((result) => {
        if (result.isConfirmed) {
            let a = document.createElement('a')
            a.href="guide.html"
            a.click()
        } else if (result.isDenied) {
          Swal.fire("", "Software pronto all'uso", "info");
        }
      });
});

// Esportazione in JSON
document.getElementById("saveJSONBtn").addEventListener("click", () => {
  
    let json = stage.toJSON();
    // json.
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'konva_scene.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// window.addEventListener('beforeunload', (event) => {
//     event.returnValue=""
// })

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


// 

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
//                 let foundAttr = rel.attributes.find(attr => attr.circle === atribute || attr.text === atribute);
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


// setInterval(() => {
//     entities.forEach(element => {
//         console.log(type(element))
//     });
// }, 500);