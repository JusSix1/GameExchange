/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-pascal-case */
/* eslint-disable jsx-a11y/alt-text */
import * as React from "react";
import {
  DataGrid,
  FilterColumnsArgs,
  GetColumnForNewFilterArgs,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Moment from "moment";
import ip_address from "../ip";
import { Link as RouterLink } from "react-router-dom";
import { AccountsInterface } from "../../models/account/IAccount";
import { GamesInterface } from "../../models/account/IGame";
import { PostsInterface } from "../../models/post/IPost";
import "./Game_Account.css";
import { ReqSellersInterface } from "../../models/reqseller/IReqSeller";
import ReqSeller_Status_Table_UI from "../ReqSeller/ReqSeller_Status_Table_UI";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const styles: { [name: string]: React.CSSProperties } = {
  container: {
    marginTop: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textareaDefaultStyle: {
    padding: 5,
    width: "100%",
    height: "100%",
    display: "block",
    resize: "none",
    backgroundColor: "#F",
    fontSize: 16,
  },
};

export default function All_My_Account_UI() {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [account, setAccount] = React.useState<AccountsInterface[]>([]);
  const [importAccount, setImportAccount] = React.useState<
    Partial<AccountsInterface>
  >({});
  const [statusSeller, setStatusSeller] = React.useState<ReqSellersInterface>();
  const [noReq, setNoReq] = React.useState<boolean>();
  const [post, setPost] = React.useState<Partial<PostsInterface>>({});
  const [game, setGame] = React.useState<GamesInterface[]>([]);
  const [newName, setNewName] = React.useState<string>();

  const [imageString, setImageString] = React.useState<
    string | ArrayBuffer | null
  >(null);
  const [description, setDescription] = React.useState<String>("");
  const [buttonDialogAccount, setButtonDialogAccount] =
    React.useState<String>("");
    const [headerDialogAccount, setHeaderDialogAccount] =
    React.useState<String>("");

  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
  const [dialogCreateOpen, setDialogCreateOpen] = React.useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = React.useState(false);
  const [dialogPostOpen, setDialogPostOpen] = React.useState(false);
  const [dialogNewGameOpen, setDialogNewGameOpen] = React.useState(false);

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  Moment.locale("th");

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton sx={{ color: "#00ADB5" }} />
        <GridToolbarFilterButton sx={{ color: "#00ADB5" }} />
        <GridToolbarDensitySelector sx={{ color: "#00ADB5" }} />
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    { field: "ID_Account", headerName: "ID", width: 70 },
    {
      field: "Game",
      headerName: "Game",
      width: 200,
      valueFormatter: (params) => String(params?.value.Name),
    },
    { field: "Game_Account", headerName: "Game Account", width: 200 },
    { field: "Game_Password", headerName: "Game password", width: 200 },
    { field: "Email", headerName: "Email", width: 200 },
    { field: "Email_Password", headerName: "Email password", width: 200 },
    { field: "Price", headerName: "Price", width: 100 },
    {
      field: "A",
      headerName: "Post",
      width: 200,
      renderCell: (params) => (
        <>
          {params.row.Is_Post && !params.row.Is_Sell ? (
            <Button
              disabled={params.row.Is_Sell}
              size="small"
              variant="contained"
              sx={{ backgroundColor: "#393E46" }}
              color="warning"
              component={RouterLink}
              to={"/edit_post/" + params.row.ID}
            >
              Edit Post
            </Button>
          ) : !params.row.Is_Post && !params.row.Is_Sell ? (
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: "#00ADB5" }}
              onClick={() => handlePostButtonClick(params.row.ID)}
            >
              Post
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: "#393E46" }}
              color="warning"
              component={RouterLink}
              to={"/Individual_Post/" + params.row.ID}
            >
              View Post
            </Button>
          )}
        </>
      ),
    },
    {
      field: "B",
      headerName: "Edit",
      width: 200,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          sx={{ backgroundColor: "#00ADB5" }}
          onClick={() => handleEditButtonClick(params.row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const filterColumns = ({
    field,
    columns,
    currentFilters,
  }: FilterColumnsArgs) => {
    // remove already filtered fields from list of columns
    const filteredFields = currentFilters?.map((item) => item.field);
    return columns
      .filter(
        (colDef) =>
          colDef.filterable &&
          (colDef.field === field || !filteredFields.includes(colDef.field))
      )
      .map((column) => column.field);
  };

  const getColumnForNewFilter = ({
    currentFilters,
    columns,
  }: GetColumnForNewFilterArgs) => {
    const filteredFields = currentFilters?.map(({ field }) => field);
    const columnForNewFilter = columns
      .filter(
        (colDef) => colDef.filterable && !filteredFields.includes(colDef.field)
      )
      .find((colDef) => colDef.filterOperators?.length);
    return columnForNewFilter?.field ?? null;
  };

  const isOptionEqualToValue = (option: { ID: any }, value: { ID: any }) => {
    return option.ID === value.ID;
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccess(false);
    setError(false);
    setErrorMsg("");
  };

  const handlePostButtonClick = (id: number) => {
    setPost({ ...post, Account_ID: id });
    handleDialogPostClickOpen();
  };

  const handleEditButtonClick = (data: any) => {
    setImportAccount(data);
    handleDialogEditClickOpen();
  };

  const handleDialogCreateClickOpen = () => {
    setDialogCreateOpen(true);
    setHeaderDialogAccount("Add an account");
    setButtonDialogAccount("Import");
  };

  const handleDialogCreateClickClose = () => {
    setDialogCreateOpen(false);
    setImportAccount({});
  };

  const handleDialogDeleteClickOpen = () => {
    setDialogDeleteOpen(true);
  };

  const handleDialogDeleteClickClose = () => {
    setDialogDeleteOpen(false);
  };

  const handleDialogPostClickOpen = () => {
    setDialogPostOpen(true);
  };

  const handleDialogPostClickClose = () => {
    setDialogPostOpen(false);
    setImageString(null);
  };

  const handleDialogNewGameClickOpen = () => {
    setDialogCreateOpen(false);
  };

  const handleDialogNewGameClickClose = () => {
    setDialogNewGameOpen(false);
    setNewName(undefined);
  };

  const handleDialogEditClickOpen = () => {
    setDialogCreateOpen(true);
    setHeaderDialogAccount("Edit account");
    setButtonDialogAccount("Save");
  };

  const handleImageChange = (event: any) => {
    const image = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      const base64Data = reader.result;
      setImageString(base64Data);
    };
  };

  const textAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const GetStatusSeller = async () => {
    const apiUrl =
      ip_address() + "/statusseller/" + localStorage.getItem("email");
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        if (res.data) {
          setStatusSeller(res.data);
          setNoReq(false);
        }
        if (res.error) {
          setNoReq(true);
        }
      });
  };

  const getAccount = async () => {
    const apiUrl =
      ip_address() + "/all-account/" + localStorage.getItem("email"); // email คือ email ที่ผ่านเข้ามาทาง parameter
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        if (res.data) {
          setAccount(res.data);
        }
      });
  };

  const getGame = async () => {
    const apiUrl = ip_address() + "/games";
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          await setGame(res.data);
        }
      });
  };

  const CreateAccount = async () => {
    setDialogLoadOpen(true);

    let data = {
      //ประกาศก้อนข้อมูล
      Game_Account: importAccount.Game_Account,
      Game_Password: importAccount.Game_Password,
      Email: importAccount.Email,
      Email_Password: importAccount.Email_Password,
      Game_ID: importAccount.Game_ID,
      Price: importAccount.Price,
    };

    const apiUrl = ip_address() + "/account/" + localStorage.getItem("email"); //ส่งขอการเพิ่ม
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          handleDialogCreateClickClose();
          getAccount();
          setImportAccount({});
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });

    setDialogLoadOpen(false);
  };

  const EditAccount = async () => {
    setDialogLoadOpen(true);

    let data = {
      //ประกาศก้อนข้อมูล
      ID: importAccount.ID,
      Game_Account: importAccount.Game_Account,
      Game_Password: importAccount.Game_Password,
      Email: importAccount.Email,
      Email_Password: importAccount.Email_Password,
      Game_ID: importAccount.Game_ID,
      Price: importAccount.Price,
    };

    const apiUrl = ip_address() + "/account"; //ส่งขอการเพิ่ม
    const requestOptions = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          handleDialogCreateClickClose();
          getAccount();
          setImportAccount({});
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });

    setDialogLoadOpen(false);
  };

  const DeleteAccount = async () => {
    if (rowSelectionModel.length !== 0) {
      setDialogLoadOpen(true);

      var dataArr = [];

      for (var i = 0; i < rowSelectionModel.length; i++) {
        dataArr.push({
          ID: rowSelectionModel[i],
        });
      }

      const apiUrl = ip_address() + "/account"; //ส่งขอการแก้ไข
      const requestOptions = {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataArr),
      };

      await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then(async (res) => {
          if (res.data) {
            setSuccess(true);
            handleDialogDeleteClickClose();
            getAccount();
          } else {
            setError(true);
            setErrorMsg(" - " + res.error);
          }
        });

      setDialogLoadOpen(false);
    } else {
      setError(true);
      setErrorMsg(" - No account selected");
    }
  };

  const CreatePost = async () => {
    setDialogLoadOpen(true);

    let data = {
      //ประกาศก้อนข้อมูล
      Account_ID: post.Account_ID,
      Description: description,
      Advertising_image: imageString,
    };

    const apiUrl = ip_address() + "/post/" + localStorage.getItem("email"); //ส่งขอการเพิ่ม
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          handleDialogPostClickClose();
          getAccount();
          setPost({});
          setImageString(null);
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });
    setDialogLoadOpen(false);
  };

  const CreateReqNewGame = async () => {
    setDialogLoadOpen(true);

    let data = {
      Name: newName,
    };

    const apiUrl = ip_address() + "/reqgame/" + localStorage.getItem("email"); //ส่งขอการเพิ่ม
    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          getGame();
          handleDialogNewGameClickClose();
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });
    setDialogLoadOpen(false);
  };

  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (count === 0) {
      const fetchData = async () => {
        setDialogLoadOpen(true);
        await GetStatusSeller();
        await getAccount();
        await getGame();
        setDialogLoadOpen(false);
      };
      fetchData();
      setCount(1);
    }
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [count, description]);

  if (!noReq && (statusSeller?.Is_Confirm || statusSeller?.Is_Cancel)) {
    return (
      <>
        <Grid>
          <Snackbar //ป้ายบันทึกสำเร็จ
            open={success}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleClose} severity="success">
              Succes
            </Alert>
          </Snackbar>

          <Snackbar //ป้ายบันทึกไม่สำเร็จ
            open={error}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleClose} severity="error" id="error">
              Error {errorMsg}
            </Alert>
          </Snackbar>

          <Grid //ตารางแสดงผล
            container
            sx={{ padding: 2 }}
          >
            <div style={{ height: "80vh", width: "100%" }}>
              <DataGrid
                style={{ background: "#3a3b3c", color: "white" }}
                rows={account}
                getRowId={(row) => row.ID}
                slots={{ toolbar: CustomToolbar }}
                columns={columns}
                slotProps={{
                  filterPanel: {
                    filterFormProps: {
                      filterColumns,
                    },
                    getColumnForNewFilter,
                  },
                }}
                checkboxSelection
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                disableRowSelectionOnClick
              />
            </div>
          </Grid>

          <Grid //ปุ่ม Import, Delete
            container
            sx={{ padding: 2 }}
          >
            <Grid sx={{ padding: 2 }}>
              <button
                className="button-slip"
                onClick={() => handleDialogCreateClickOpen()}
              >
                Add Account
              </button>
            </Grid>
            <Grid sx={{ padding: 2 }}>
              <button
                className="button-cancel"
                onClick={() => handleDialogDeleteClickOpen()}
              >
                Delete Account
              </button>
            </Grid>
          </Grid>

          <Dialog //Account
            open={dialogCreateOpen}
            onClose={handleDialogCreateClickClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {headerDialogAccount}
            </DialogTitle>

            <DialogContent>
              <Box>
                <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                  <Grid container>
                    <Grid container>
                      <Grid>Game</Grid>
                      <Grid container>
                        <Grid margin={1} item xs={5}>
                          <Autocomplete
                            id="game-autocomplete"
                            options={game}
                            fullWidth
                            size="small"
                            value={
                              importAccount.Game_ID
                                ? game.find(
                                    (option) =>
                                      option.ID === importAccount.Game_ID
                                  )
                                : null
                            }
                            onChange={(event: any, value) => {
                              setImportAccount({
                                ...importAccount,
                                Game_ID: value?.ID,
                              });
                            }}
                            getOptionLabel={(option: any) => `${option.Name}`}
                            renderInput={(params: any) => {
                              return (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  placeholder="Search..."
                                />
                              );
                            }}
                            renderOption={(props: any, option: any) => {
                              return (
                                <li
                                  {...props}
                                  value={option.ID}
                                  key={option.ID}
                                >
                                  {option.Name}
                                </li>
                              );
                            }}
                            isOptionEqualToValue={isOptionEqualToValue}
                          />
                          <a
                            href={`/RequestGame`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleDialogNewGameClickOpen}
                          >
                            Don't have a game name?
                          </a>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                      <Grid>Game account</Grid>
                      <Grid container>
                        <Grid margin={1} item xs={5}>
                          <TextField
                            fullWidth
                            id="game_account"
                            label="Account"
                            type="string"
                            variant="outlined"
                            value={importAccount.Game_Account}
                            onChange={(event) =>
                              setImportAccount({
                                ...importAccount,
                                Game_Account: event.target.value,
                              })
                            }
                          />
                        </Grid>
                        <Grid margin={1} item xs={5}>
                          <TextField
                            fullWidth
                            id="game_password"
                            label="Password"
                            type="string"
                            variant="outlined"
                            value={importAccount.Game_Password}
                            onChange={(event) =>
                              setImportAccount({
                                ...importAccount,
                                Game_Password: event.target.value,
                              })
                            }
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                    <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                      <Grid>Email account</Grid>
                      <Grid container>
                        <Grid margin={1} item xs={5}>
                          <TextField
                            fullWidth
                            id="email"
                            label="Email"
                            type="string"
                            variant="outlined"
                            value={importAccount.Email}
                            onChange={(event) =>
                              setImportAccount({
                                ...importAccount,
                                Email: event.target.value,
                              })
                            }
                          />
                        </Grid>
                        <Grid margin={1} item xs={5}>
                          <TextField
                            fullWidth
                            id="email_password"
                            label="Password"
                            type="string"
                            variant="outlined"
                            value={importAccount.Email_Password}
                            onChange={(event) =>
                              setImportAccount({
                                ...importAccount,
                                Email_Password: event.target.value,
                              })
                            }
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                    <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                      <Grid item xs={12}>
                        Price
                      </Grid>
                      <Grid margin={1} item>
                        <TextField
                          fullWidth
                          id="Price"
                          label="Price"
                          type="number"
                          variant="outlined"
                          value={importAccount.Price}
                          onChange={(event) =>
                            setImportAccount({
                              ...importAccount,
                              Price: Number(event.target.value),
                            })
                          }
                        />
                      </Grid>
                    </Paper>
                  </Grid>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                size="small"
                onClick={handleDialogCreateClickClose}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                size="small"
                onClick={
                  buttonDialogAccount === "Import" ? CreateAccount : EditAccount
                }
                sx={{ color: "#00ADB5" }}
                autoFocus
              >
                {buttonDialogAccount}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog //Delete
            open={dialogDeleteOpen}
            onClose={handleDialogDeleteClickClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth={true}
            maxWidth="sm"
          >
            <DialogTitle id="alert-dialog-title">
              {"Delete Account"}
            </DialogTitle>
            <DialogActions>
              <Button size="small" onClick={handleDialogDeleteClickClose}>
                Cancel
              </Button>
              <Button
                size="small"
                onClick={DeleteAccount}
                sx={{ color: "#ff753e" }}
                color="error"
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog //post
            open={dialogPostOpen}
            onClose={handleDialogPostClickClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth={true}
            maxWidth="xl"
          >
            <DialogTitle id="alert-dialog-title">
              {"Post information"}
            </DialogTitle>

            <DialogContent>
              <Box>
                <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                  <Grid container>
                    <Grid item xs={12}>
                      <h4>Description</h4>
                    </Grid>
                    <Grid item xs={12} sx={{ marginX: 2 }}>
                      <textarea
                        ref={textareaRef}
                        style={styles.textareaDefaultStyle}
                        onChange={textAreaChange}
                      >
                        {description}
                      </textarea>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <h4>Advertising Image</h4>
                    <div className="div-add-advertising-image">
                      {imageString ? (
                        <img
                          src={`${imageString}`}
                          width="100%"
                          height="100%"
                        />
                      ) : (
                        <>
                          <input
                            type="file"
                            id="Add-Advertising-Image"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                            accept=".jpg, .jpeg, .png"
                          />
                          <label htmlFor="Add-Advertising-Image">
                            <AddPhotoAlternateIcon
                              sx={{
                                fontSize: 120,
                                margin: 1,
                                padding: 2,
                                cursor: "pointer", // เปลี่ยนรูปแบบเคอร์เซอร์เป็นตัวเลือก
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>
                    {imageString ? (
                      <>
                        <input
                          type="file"
                          id="Add-Advertising-Image"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                          accept=".jpg, .jpeg, .png"
                        />
                        <label
                          htmlFor="Add-Advertising-Image"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="div-change-Advertising-image">
                            Change Image
                          </div>
                        </label>
                      </>
                    ) : null}
                  </Grid>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                size="small"
                onClick={handleDialogPostClickClose}
                color="error"
              >
                Cancel
              </Button>
              <Button size="small" onClick={CreatePost} color="info" autoFocus>
                Post
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog //new game
            open={dialogNewGameOpen}
            onClose={handleDialogNewGameClickClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="xl"
          >
            <DialogTitle id="alert-dialog-title">
              {"Request new game"}
            </DialogTitle>

            <DialogContent>
              <Box>
                <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>Admin will check before adding this list.</p>
                    </Grid>
                    <Grid item xs={12} sx={{ marginX: 2 }}>
                      <TextField
                        fullWidth
                        id="new-game-name"
                        label="Name"
                        type="string"
                        variant="outlined"
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                size="small"
                onClick={handleDialogNewGameClickClose}
                color="error"
              >
                Cancel
              </Button>
              <Button
                size="small"
                onClick={CreateReqNewGame}
                color="info"
                autoFocus
              >
                Send
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog //Load
            open={dialogLoadOpen}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div className="custom-loader" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div>Loading...</div>
              </div>
            </DialogTitle>
          </Dialog>
        </Grid>
      </>
    );
  } else {
    return <ReqSeller_Status_Table_UI />;
  }
}
