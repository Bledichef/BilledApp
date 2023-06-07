/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("When I click on the new bill button", () => {
  test("Then a modal with a form should open", () => {
    //si l'user se trouve sur la page contenant bills dans url -> on affiche la route du même nom
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // On est sur la page employé
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // on instancie la classe Bills
    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      bills,
      localStorage: window.localStorage,
    });

    const button = screen.getByTestId("btn-new-bill"); //on récup le data-testid du bouton

    const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
    button.addEventListener("click", handleClickNewBill); // au clic on appelle la fonction
    userEvent.click(button); // On simule le click

    expect(handleClickNewBill).toHaveBeenCalled(); //on vérifie que la fonction simulée a bien été appelée
    const modaleNewBill = screen.getByTestId("form-new-bill"); // on récup le dataId de la modale
    expect(modaleNewBill).toBeTruthy(); // on vérifie que la modale s'est bien ouverte (si elle apparait)
  });
});

/*
  Teste quand on click sur l'icone oeil si une modale avec le justificatif s'ouvre
  */
describe("When I click on the icon eye", () => {
  test("Then a modal with picture of a bill should open", async () => {
    //si l'user se trouve sur la page contenant bills dans url -> on affiche la route du même nom
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    // On est sur la page employé
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // on instancie la classe Bills
    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      bills,
      localStorage: window.localStorage,
    });

    $.fn.modal = jest.fn();

    const icon = screen.getAllByTestId("icon-eye"); //on récup tout ce qui a le data-testid = icon-eye
    const firstIcon = icon[0]; //récup le 1er élément pour le test

    const handleClickIconEye = jest.fn(() =>
      bill.handleClickIconEye(firstIcon)
    ); //simule la fonction handleClickIconEye

    firstIcon.addEventListener("click", handleClickIconEye); //Au click on appelle la fonction
    userEvent.click(firstIcon); //simule le click

    expect(handleClickIconEye).toHaveBeenCalled(); //on vérifie que la fonction simulée a bien été appelée
    await waitFor(() => {});
    expect(modaleFile).toBeTruthy(); //on vérifie que la modale s'est bien ouverte au click (si elle est visible)
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const allContentBills = await screen.getByText("Mes notes de frais");
      expect(allContentBills).toBeTruthy();

      await waitFor(() => screen.getByText("En attente"));
      const contentPending = await screen.getAllByText("En attente");
      expect(contentPending).toBeTruthy();

      await waitFor(() => screen.getByText("Accepté"));
      const contentAccepted = await screen.getAllByText("Accepté");
      expect(contentAccepted).toBeTruthy();

      await waitFor(() => screen.getAllByText("Refused"));
      const contentRefused = await screen.getAllByText("Refused");
      expect(contentRefused).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
