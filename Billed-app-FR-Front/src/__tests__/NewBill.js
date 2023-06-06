/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

//Test parcours employé ajout d'une nouvelle note possibilité d'ajouter un fichier
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should click on 'Choisir un fichier' for add a new file", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      //on se trouve sur le parcours employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      //on instancie une nouvelle instance de la classe NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)); //on simule la fonction handleChangeFile

      const addFileButton = screen.getByTestId("file"); //on récup le datatestId du bouton submit

      addFileButton.addEventListener("click", handleChangeFile); //on appelle la fonction au click
      userEvent.click(addFileButton); //on simule le click
      expect(handleChangeFile).toHaveBeenCalled(); //on teste si la fonction a été appelée
    });
  });
});

/*
    message d'erreur doit apparaitre en cas  d'un fichier au mauvais format
    */
describe("When I am on NewBill Page, and I upload an incorrect file(test.txt for example)", () => {
  test("Then, it should display an error message", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)); //on simule la fonction handleChangeFile

    const addFileButton = screen.getByTestId("file"); //on récup le datatestId du bouton submit

    addFileButton.addEventListener("change", handleChangeFile);

    userEvent.click(addFileButton, {
      //on simule un fichier de type texte
      target: {
        files: [new File(["test.txt"], "test.txt", { type: "text/txt" })],
      },
    });

    expect(addFileButton.files[0].name).toBe("test.txt"); // Le fichier est : test.txt
    expect(addFileButton.files[0].name.endsWith("jpeg")).not.toBeTruthy(); // Le fichier n'a pas comme fin jpeg
    expect(addFileButton.files[0].name.endsWith("jpg")).not.toBeTruthy(); // Le fichier n'a pas comme fin jpg
    expect(addFileButton.files[0].name.endsWith("png")).not.toBeTruthy(); // Le fichier n'a pas comme fin png

    // Le message d'erreur apparait car le fichier n'est pas au format attendu
    const errorMessage = screen.getByTestId("errorMessage");
    expect(errorMessage).toBeTruthy();
  });
});
/*
    Teste si on voit bien apparaitre le nom du fichier ajouté en cas d'upload d'un fichier au bon format
    */
describe("When I am on NewBill Page, and I upload a correct file(jpg, jpeg, png)", () => {
  test("Then, it should render the file's name", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)); //on simule la fonction handleChangeFile

    const addFileButton = screen.getByTestId("file"); //on récup le datatestId du bouton submit

    addFileButton.addEventListener("change", handleChangeFile);

    userEvent.click(addFileButton, {
      //on simule un fichier de type jpeg
      target: {
        files: [new File(["test.jpeg"], "test.jpeg", { type: "image/jpeg" })],
      },
    });

    expect(addFileButton.files[0].name).toBe("test.jpeg"); // Le fichier est : test.jpeg

    expect(addFileButton.files[0].name.endsWith("jpeg")).toBeTruthy(); // Le fichier a comme fin jpeg
  });
});
/*
Test d'intégration POST - création d'une nouvelle note de frais par un employé
*/
describe("Given I am connected as an employee", () => {
  describe("When I submit a valid bill", () => {
    test("Then a new bill is created", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const simulBill = {
        type: "Restaurants et bars",
        name: "Marion",
        amount: 300,
        date: "2008-08-08",
        vat: "60",
        pct: 20,
        commentary: "Repas équipe",
        fileUrl: "../src/img/restau.jpg",
        fileName: "restau.jpg",
      };

      const submitButton = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      newBill.create = (newBill) => newBill;

      document.querySelector(`input[data-testid="expense-name"]`).value =
        simulBill.name;
      document.querySelector(`input[data-testid="datepicker"]`).value =
        simulBill.date;
      document.querySelector(`select[data-testid="expense-type"]`).value =
        simulBill.type;
      document.querySelector(`input[data-testid="amount"]`).value =
        simulBill.amount;
      document.querySelector(`input[data-testid="vat"]`).value = simulBill.vat;
      document.querySelector(`input[data-testid="pct"]`).value = simulBill.pct;
      document.querySelector(`textarea[data-testid="commentary"]`).value =
        simulBill.commentary;
      newBill.fileUrl = simulBill.fileUrl;
      newBill.fileName = simulBill.fileName;

      submitButton.addEventListener("click", handleSubmit);
      userEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
