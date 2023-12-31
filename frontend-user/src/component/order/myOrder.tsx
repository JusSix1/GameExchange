/* eslint-disable react/jsx-pascal-case */
/* eslint-disable jsx-a11y/alt-text */
import * as React from "react";
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
} from "@mui/material";
import Moment from "moment";

import ip_address from "../ip";
import { OrdersInterface } from "../../models/order/IOrder";
import moment from "moment";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridColDef,
  DataGrid,
  FilterColumnsArgs,
  GetColumnForNewFilterArgs,
} from "@mui/x-data-grid";
import { ReqSellersInterface } from "../../models/reqseller/IReqSeller";
import ReqSeller_Status_Table_UI from "../ReqSeller/ReqSeller_Status_Table_UI";

export default function My_Order_UI() {
  const [order, setOrder] = React.useState<OrdersInterface[]>([]);
  const [statusSeller, setStatusSeller] = React.useState<ReqSellersInterface>();
  const [noReq, setNoReq] = React.useState<boolean>();

  const [imageString, setImageString] = React.useState<
    string | ArrayBuffer | null
  >(null);
  const [orderID, setOrderID] = React.useState<Number>();
  const [newNote, setNewNote] = React.useState<string>();
  const [note, setNote] = React.useState<string>();

  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [dialogLoadOpen, setDialogLoadOpen] = React.useState(false);
  const [dialogSlipOpen, setDialogSlipOpen] = React.useState(false);
  const [dialogConfirmSlipOpen, setDialogConfirmSlipOpen] =
    React.useState(false);
  const [dialogRejectOpen, setDialogRejectOpen] = React.useState(false);
  const [dialogCancelOpen, setDialogCancelOpen] = React.useState(false);
  const [dialogNoteOpen, setDialogNoteOpen] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

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
    {
      field: "ID",
      headerName: "ID",
      width: 70,
    },
    {
      field: "User",
      headerName: "Buyer",
      width: 200,
      renderCell: (params) => (
        <a
          href={`/profile/${String(params?.value.Profile_Name)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {String(params?.value.Profile_Name)}
        </a>
      ),
    },
    {
      field: "Account",
      headerName: "Account name",
      width: 200,
      valueFormatter: (params) => String(params?.value.Game_Account),
    },
    {
      field: "Slip_Create_At",
      headerName: "Slip Created At",
      width: 200,
      valueFormatter: (params) =>
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
      field: "Is_Receive",
      headerName: "Is Receive",
      width: 200,
      renderCell: (params) => (
        <span>
          {params.value && params.row.Is_Slip_Confirm
            ? "Received"
            : !params.value && params.row.Is_Slip_Confirm
            ? "Not Received"
            : null}
        </span>
      ),
    },
    {
      field: "Slip",
      headerName: "Slip",
      width: 150,
      renderCell: (params) => (
        <Button
          disabled={!params.row.Slip}
          size="small"
          variant="contained"
          color="inherit"
          style={{ color: "#000" }}
          onClick={() => handleSlipButtonClick(params.row.Slip)}
        >
          View Slip
        </Button>
      ),
    },
    {
      field: "confirm",
      headerName: "Confirm",
      width: 150,
      renderCell: (params) => (
        <Button
          disabled={
            !(params.row.Slip && !params.row.Is_Slip_Confirm)
          }
          size="small"
          variant="contained"
          color="primary"
          sx={{ backgroundColor: "#00ADB5" }}
          onClick={() => handleConfirmButtonClick(params.row.ID)}
        >
          Confirm Slip
        </Button>
      ),
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 150,
      renderCell: (params) => (
        <Button
          disabled={
            !(params.row.Slip && !params.row.Is_Slip_Confirm) || params.row.Is_Reject
          }
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleRejectButtonClick(params.row.ID)}
        >
          Reject
        </Button>
      ),
    },
    {
      field: "cancel",
      headerName: "cancel",
      width: 150,
      renderCell: (params) => (
        <Button
          disabled={!!params.row.Is_Slip_Confirm}
          size="small"
          variant="contained"
          color="error"
          sx={{ backgroundColor: "#ff753e" }}
          onClick={() => handleCanelButtonClick(params.row.ID)}
        >
          cancel
        </Button>
      ),
    },
    {
      field: "viewpost",
      headerName: "post",
      width: 150,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => handlePostButtonClick(params.row.Account_ID)}
        >
          View
        </Button>
      ),
    },
    {
      field: "Note",
      headerName: "Note",
      width: 200,
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

  const handleSlipButtonClick = (slipBase64: string) => {
    setImageString(slipBase64);
    setDialogSlipOpen(true);
  };

  const handleCloseSlipDialog = () => {
    setDialogSlipOpen(false);
    setImageString(null);
  };

  const handleConfirmButtonClick = (ID: Number) => {
    setOrderID(ID);
    setDialogConfirmSlipOpen(true);
  };

  const handleRejectButtonClick = (ID: Number) => {
    setOrderID(ID);
    setDialogRejectOpen(true);
  };

  const handleDialogConfrimClickClose = () => {
    setDialogConfirmSlipOpen(false);
  };

  const handleDialogRejectClickClose = () => {
    setDialogRejectOpen(false);
    setNewNote(undefined);
  };

  const handleCanelButtonClick = (ID: Number) => {
    setOrderID(ID);
    setDialogCancelOpen(true);
  };

  const handlePostButtonClick = (ID: Number) => {
    window.open("/Individual_Post/" + ID);
  };

  const handleDialogCancelClickClose = () => {
    setDialogCancelOpen(false);
  };

  const handleDialogNoteClickClose = () => {
    setNote(undefined);
    setDialogNoteOpen(false);
  };

  const handleSlip = () => {
    if (imageString) {
      return (
        <img src={`${imageString}`} alt="Slip" width="100%" height="auto" />
      );
    } else {
      return <Grid>No slip upload</Grid>;
    }
  };

  const textAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(event.target.value);
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

  const getMyOrder = async () => {
    const apiUrl = ip_address() + "/myorder/" + localStorage.getItem("email"); // email คือ email ที่ผ่านเข้ามาทาง parameter
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
          setOrder(res.data);
        }
      });
  };

  const ConfirmSlip = () => {
    let data = {
      ID: orderID,
    };
    const apiUrl = ip_address() + "/orderslipconfirm"; //ส่งขอการแก้ไข
    const requestOptions = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          getMyOrder();
          setDialogConfirmSlipOpen(false);
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });
  };

  const Reject = () => {
    let data = {
      ID: orderID,
      Note: newNote,
    };
    const apiUrl = ip_address() + "/orderreject"; //ส่งขอการแก้ไข
    const requestOptions = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then(async (res) => {
        if (res.data) {
          setSuccess(true);
          getMyOrder();
          handleDialogRejectClickClose();
        } else {
          setError(true);
          setErrorMsg(" - " + res.error);
        }
      });
  };

  const CancelOrder = async () => {
    setDialogLoadOpen(true);

    let data = {
      ID: orderID,
    };

    const apiUrl = ip_address() + "/cancelorder"; //ส่งขอการแก้ไข
    const requestOptions = {
      method: "DELETE",
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
          handleDialogCancelClickClose();
          getMyOrder();
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
        await getMyOrder();
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
  }, [count, newNote]);

  if (!noReq && (statusSeller?.Is_Confirm || statusSeller?.Is_Cancel)) {
    return (
      <>
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
          <Alert onClose={handleClose} severity="error">
            Error {errorMsg}
          </Alert>
        </Snackbar>

        <Grid //ตารางแสดงผล
          container
          sx={{ padding: 2 }}
        >
          <div style={{ height: "90vh", width: "100%" }}>
            <DataGrid
              style={{ background: "#3a3b3c", color: "white" }}
              rows={order}
              getRowId={(row) => row.ID}
              slots={{ toolbar: CustomToolbar }}
              columns={columns}
              onCellClick={(params) => {
                if (params.field === "Note") {
                  const preNote = params?.value;
                  setNote(String(preNote));
                  setDialogNoteOpen(true);
                }
              }}
              slotProps={{
                filterPanel: {
                  filterFormProps: {
                    filterColumns,
                  },
                  getColumnForNewFilter,
                },
              }}
            />
          </div>
        </Grid>

        <Dialog //view slip
          open={dialogSlipOpen}
          onClose={handleCloseSlipDialog}
        >
          <DialogTitle>Slip Image</DialogTitle>
          <DialogContent>{handleSlip()}</DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseSlipDialog}
              color="inherit"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog //confirm
          open={dialogConfirmSlipOpen}
          onClose={handleDialogConfrimClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="sm"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm slip"}</DialogTitle>
          <DialogActions>
            <Button
              size="small"
              onClick={handleDialogConfrimClickClose}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              size="small"
              onClick={ConfirmSlip}
              sx={{ color: "#00ADB5" }}
              color="primary"
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog //reject
          open={dialogRejectOpen}
          onClose={handleDialogRejectClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="sm"
        >
          <DialogTitle id="alert-dialog-title">{"Reject"}</DialogTitle>
          <DialogContent>
            <Grid container>
              <p>Note</p>
              <textarea
                ref={textareaRef}
                style={{
                  padding: 5,
                  marginTop: 10,
                  width: "98%",
                  height: "100%",
                  display: "block",
                  resize: "none",
                  backgroundColor: "#F",
                  fontSize: 16,
                  borderRadius: "5px",
                }}
                onChange={textAreaChange}
                value={newNote}
              ></textarea>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleDialogRejectClickClose}
              color="inherit"
            >
              Cancel
            </Button>
            <Button size="small" onClick={Reject} color="secondary" autoFocus>
              Reject
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog //Cancel
          open={dialogCancelOpen}
          onClose={handleDialogCancelClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={true}
          maxWidth="sm"
        >
          <DialogTitle id="alert-dialog-title">{"Cancel order"}</DialogTitle>
          <DialogActions>
            <Button size="small" onClick={handleDialogCancelClickClose}>
              Cancel
            </Button>
            <Button
              size="small"
              onClick={CancelOrder}
              sx={{ color: "#ff753e" }}
              color="error"
              autoFocus
            >
              Cancel Order
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog //Note
        open={dialogNoteOpen}
        onClose={handleDialogNoteClickClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">{"Note"}</DialogTitle>
        <DialogContent>
          <Box>
            <Paper elevation={2} sx={{ padding: 2, margin: 2 }}>
              <Grid container>
                <div className="note-content">{note}</div>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={handleDialogNoteClickClose}
            color="inherit"
          >
            close
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
      </>
    );
  } else {
    return <ReqSeller_Status_Table_UI />;
  }
}
