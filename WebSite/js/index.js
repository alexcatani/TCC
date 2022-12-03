var headerCurrent = 1;
var pageCurrent = 1;
var interval = 0;
var update = false;
var count = 0;
var _pageObjectImages = [];

var _PATH_CONFIG = "./config/config.json";
var pdfjsLib = window["pdfjs-dist/build/pdf"];
var img = document.getElementById("imageBackground");
var iframe = document.getElementById("iframeBackground");
var object = document.getElementById("objectBackground");

pdfjsLib.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.js";

/**
 * Esta é uma função que renderiza PDF passando sua URL
 *
 * @viewPDF
 *   viewPDF(url);
 *
 * @param {string} url
 */
function viewPDF(url) {
  var loadingTask = pdfjsLib.getDocument(url);

  loadingTask.promise.then(
    function (pdf) {
      var pageNumber = 1;
      pdf.getPage(pageNumber).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        var canvas = document.getElementById("objectBackground");
        var context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          object.classList.add("active");
        });
      });
    },
    function (reason) {
      alert("Erro ao exibir PDF");
      console.error(reason);
    }
  );
}

/**
 * Esta função captura os parametros passados na URL e armazena em variaveis (headerCurrent, pageCurrent)
 *
 * @getParams
 *   getParams();
 *
 */
function getParams() {
  var query = location.search.slice(1);
  var params = query.split("&");

  var data = {};
  params.forEach(function (part) {
    var values = part.split("=");
    var key = values[0];
    var value = values[1];
    data[key] = value;
  });
  headerCurrent = data.menu;
  pageCurrent = data.sub_menu;
}

/**
 * Esta função captura os parametros passados na URL e returna o objeto
 *
 * @getParamsReturns
 *   getParamsReturns();
 *
 */
function getParamsReturns() {
  var query = location.search.slice(1);
  var params = query.split("&");

  var data = {};
  params.forEach((part) => {
    var values = part.split("=");
    var key = values[0];
    var value = values[1];
    data[key] = value;
  });
  return data;
}

/**
 * Esta é uma função que retorna o nome do menu já formado
 *
 * @generateNameHeader
 *   generateNameHeader(string);
 *
 * @param {string} header
 * @returns {string} string
 */
function generateNameHeader(header) {
  return `header-${header}`;
}

/**
 * Esta é uma função que retorna o nome do painel já formado
 *
 * @generateNamePage
 *   generateNamePage(string);
 *
 * @param {string} page
 * @returns {string} string
 */
function generateNamePage(header, page) {
  return `page-${header}-${page}`;
}

/**
 * Esta é uma função que fica responsavel por controlar a atualização das imagens de cada painel com base na sua configuração
 *
 * @task
 *   task();
 */
function task() {
  var length = _pageObjectImages.length;

  if (update && _pageObjectImages.length > 1) {
    count = 1;
  }

  if (_pageObjectImages.length <= 1) {
    count = 0;
  }

  validateExtension(_pageObjectImages[count].url);

  clearInterval(interval);
  interval = setInterval(task, convertTime(_pageObjectImages[count].timer));
  count = count + 1;
  if (count > length - 1) {
    count = 0;
  }
}

/**
 * Esta é uma função inicial que monta o menu e os links dos paines com base no arquivo de configuração (config.json)
 * Documentação (https://docs.google.com/document/d/1DfIM8_8cCyMvs1gpxao1TUQ4DNSyhCFd_T6NPxSdO8E)
 * @init
 *   init();
 */
async function init() {
  update = false;
  getParams();
  var paramsURL = getParamsReturns();

  fetch(_PATH_CONFIG)
    .then((response) => {
      return response.json();
    })
    .then((jsondata) => {
      var nav = document.getElementById("nav-form");

      var menus = jsondata.filter((item) => {
        //!Validando se os menus passados pela URL estão ocultos, se sim vai ser apresentado as fotos iguais, mas não vão ser apresentados no menu
        if (Number(paramsURL.menu) === Number(item.menu) && item.oculto) {
          if (pageCurrent) {
            item.paineis.map((painel) => {
              if (Number(painel.sub_menu) === Number(pageCurrent)) {
                setImage(painel.images[0].url, painel.images);
                return;
              }
            });
          } else {
            setImage(item.paineis[0].images[0].url, item.paineis[0].images);
            return;
          }
        }
        return !item.oculto;
      });

      //!Validando se menu passado pela URL é valido
      var isExists = headerCurrent ? false : true;
      if (headerCurrent) {
        isExists = jsondata.find((menu) => {
          if (Number(menu.menu) === Number(headerCurrent)) {
            return true;
          }
        });
      }

      menus.map((item, key) => {
        if (!isExists && key === 0) {
          headerCurrent = item.menu;
          console.warn("Menu não encontrado, o primeiro menu configurado!");
        } else if (!headerCurrent && key === 0) {
          headerCurrent = item.menu;
        }

        var paineis = item.paineis.filter((painel) => {
          //!Validando se o painel passado pela URL não está oculto se sim vai ser apresentado o arquivo igual porém não aparece no menu
          if (
            Number(paramsURL.sub_menu) === Number(painel.sub_menu) &&
            painel.oculto
          ) {
            setImage(painel.images[0].url, painel.images);
            return;
          }
          return !painel.oculto;
        });

        //!Validando se painel passado pela URL é valido
        var isExistsPainel = pageCurrent ? false : true;

        if (pageCurrent) {
          isExistsPainel = item.paineis.find((painel) => {
            if (Number(painel.sub_menu) === Number(pageCurrent)) {
              return true;
            }
          });
        }

        const isActive =
          Number(headerCurrent) === Number(item.menu) ? "active" : "";

        if (isActive.trim().length > 0) {
          paineis.map((painel, i) => {
            if (!isExistsPainel && i === 0) {
              setImage(painel.images[0].url, painel.images);
              pageCurrent = painel.sub_menu;
              console.warn(
                "Painel não encontrado, o primeiro painel configurado!"
              );
            } else if (
              Number(painel.sub_menu) === Number(pageCurrent) ||
              (!pageCurrent && i === 0)
            ) {
              setImage(painel.images[0].url, painel.images);
              pageCurrent = painel.sub_menu;
            }
          });
        }

        const margin = key > 0 ? "mt-2" : "";

        const firstPainel = item.paineis[0];
        const isDropdown = item.paineis.length > 1;

        nav.innerHTML += `<a
          class="button ${isActive} ${margin}"
          id="${generateNameHeader(item.menu)}"
          onclick="${
            isDropdown
              ? `openOptions(${item.menu})`
              : `handlePage(${item.menu}, ${firstPainel.sub_menu})`
          }"
          >${item.nome}
           ${isDropdown ? "<img src='assets/chevronInactive.svg'/>" : ""}
         </a>    
       `;

        if (isDropdown) {
          nav.innerHTML += `<div id="container-${item.menu}" class="container-sub-buttons"/>`;
          var container = document.getElementById(`container-${item.menu}`);
          paineis.map((page) => {
            const isActivePage =
              Number(item.menu) === Number(headerCurrent) &&
              Number(pageCurrent) === Number(page.sub_menu)
                ? "active"
                : "";

            container.innerHTML += `<a
            class="sub-button mt-2 ${isActivePage}"
            id="page-${item.menu}-${page.sub_menu}"
            onClick="handlePage(${item.menu},${page.sub_menu})"
            >${page.nome}</a
          >`;
          });
        }
      });
      $(document).ready(function () {
        interval = setInterval(
          task,
          convertTime(_pageObjectImages[count].timer)
        );
        count = count + 1;
      });
    });
}

/**
 * Esta é uma função que valida a extensão do arquivo passado pela URL e atribui o valor ao componente correto
 *
 * @validateExtension
 *   validateExtension(url);
 *
 * @param {string} url
 */
function validateExtension(url) {
  if (url.trim().length > 0) {
    var arrayExt = url.split(".");
    var extension = arrayExt[arrayExt.length - 1];

    if (
      extension.toUpperCase() === "HTM" ||
      extension.toUpperCase() === "HTML"
    ) {
      object.classList.remove("active");
      img.classList.remove("active");
      iframe.src = url;
      iframe.classList.add("active");
    } else if (extension.toUpperCase() === "PDF") {
      img.classList.remove("active");
      iframe.classList.remove("active");
      viewPDF(url);
    } else {
      object.classList.remove("active");
      iframe.classList.remove("active");
      img.classList.add("active");
      img.src = url;
    }
  }
}

function setImage(url, images) {
  validateExtension(url);
  _pageObjectImages = images;
}

/**
 * Esta é uma função que serve para abrir as opções dos paines
 *
 * @openOptions
 *   openOptions(string);
 *
 * @param {string} buttonOption
 */
function openOptions(buttonOption) {
  var button = document.getElementById(generateNameHeader(buttonOption));
  var options = document.getElementById("container-" + buttonOption);
  options.classList.toggle("active");
  button.classList.toggle("expanded");
}

/**
 * Esta é uma função que serve para trocar de painel com base no menu e no painel selecionado em tela
 *
 * @handlePage
 *   handlePage(header, page);
 *
 * @param {string} header
 * @param {string} page
 */
function handlePage(header, page) {
  update = true;
  fetch(_PATH_CONFIG)
    .then((response) => {
      return response.json();
    })
    .then((jsondata) => {
      //Validando header para saber se é preciso fechar ou não
      if (headerCurrent !== header) {
        if (document.getElementById("container-" + headerCurrent)) {
          document
            .getElementById("container-" + headerCurrent)
            .classList.remove("active");
        }

        if (document.getElementsByClassName("expanded").length > 0) {
          document
            .getElementById(generateNameHeader(headerCurrent))
            .classList.remove("expanded");
        }
      }

      //Removendo classes de ativo das paginas anteriores

      if (
        document.getElementById(generateNamePage(headerCurrent, pageCurrent))
      ) {
        document
          .getElementById(generateNamePage(headerCurrent, pageCurrent))
          .classList.remove("active");
      }

      if (document.getElementById(generateNameHeader(headerCurrent))) {
        document
          .getElementById(generateNameHeader(headerCurrent))
          .classList.remove("active");
      }

      var headerButton = document.getElementById(generateNameHeader(header));
      var pageButton = document.getElementById(generateNamePage(header, page));

      if (headerButton === pageButton) {
        headerButton.classList.toggle("active");
      } else {
        headerButton.classList.toggle("active");
        if (pageButton) {
          pageButton.classList.toggle("active");
        }
      }

      pageCurrent = page;
      headerCurrent = header;
      jsondata.map((item) => {
        const isActive = Number(headerCurrent) === Number(item.menu);
        if (isActive) {
          item.paineis.map((painel) => {
            if (Number(painel.sub_menu) === Number(page)) {
              setImage(painel.images[0].url, painel.images);
              clearInterval(interval);
              interval = setInterval(task, convertTime(painel.images[0].timer));
            }
          });
        }
      });
    });
}

/**
 * Esta é uma função que serve converter hora e minuto em milisegundos (00:00)
 *
 * @convertTime
 *   convertTime(time);
 *
 * @param {string} time
 * @returns {string} string
 */

function convertTime(time) {
  if (time.split(":")) {
    var timeConvert = time.split(":");
    if (timeConvert.length <= 1) {
      console.log(
        "Timer configurado é invalido, timer padrão de 30 segundos foi adicionado"
      );
      return 30000;
    }
    var minutes = timeConvert[0];
    var seconds = timeConvert[1];
    var date = new Date();
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    var secondMinutes = date.getMinutes() * 60;

    return Number((date.getSeconds() + secondMinutes) * 1000);
  }
}

//! Funções utilizadas pelo botão para abrir e fechar o menu
function toogle() {
  var menu = document.querySelector(".menu");
  var button = document.querySelector(".button-menu-fixed");
  var logo = document.querySelector(".logo");

  menu.classList.toggle("active");
  button.classList.toggle("menu");
  logo.classList.toggle("active");
  button.classList.remove("active");
}

function openButton() {
  if (document.querySelector(".button-menu-fixed.menu")) return;

  var button = document.querySelector(".button-menu-fixed");
  button.classList.add("active");
}

function closeButton() {
  if (document.querySelector(".button-menu-fixed.menu")) return;

  var button = document.querySelector(".button-menu-fixed");
  button.classList.remove("active");
}

document.querySelector("body").addEventListener("keydown", function (event) {
  const key = event.keyCode;
  if (key === 122) {
    var menu = document.querySelector(".menu");
    var logo = document.querySelector(".logo");
    var button = document.querySelector(".button-menu-fixed");
    menu.classList.remove("active");
    button.classList.remove("menu");
    logo.classList.remove("active");
    button.classList.remove("active");
  }
});

let seg = 0;
document.addEventListener("mousemove", function () {
  seg = 0;
});

setInterval(function () {
  seg = seg + 1;
  if (seg == 5) {
    if (document.querySelector(".button-menu-fixed.menu")) return;

    var button = document.querySelector(".button-menu-fixed");
    button.classList.remove("active");
  }
}, 500);
