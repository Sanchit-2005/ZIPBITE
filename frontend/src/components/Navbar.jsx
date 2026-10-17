import React from "react";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary">
      <div className="container-fluid">
        <img src="./logox.png" alt="" style={{height:"100px"}}/>

        <button
          className="btn btn-outline-secondary navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#navbarDrawer"
          aria-controls="navbarDrawer"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" aria-hidden="true"></span>
        </button>

        <div
          className="offcanvas offcanvas-end"
          tabIndex={-1}
          id="navbarDrawer"
          aria-labelledby="navbarDrawerLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="navbarDrawerLabel">
              Menu
            </h5>

            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Link
                </a>
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Menu
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <a className="dropdown-item" href="#">
                      Action
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <span className="nav-link disabled" aria-disabled="true">
                  Disabled
                </span>
              </li>
            </ul>

            <form
              className="d-flex gap-2"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                className="form-control"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />

              <button className="btn btn-secondary" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
