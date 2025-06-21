import { useState } from "react";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nameList, setNameList] = useState<string[]>([""]);
  const [jsonData, setJsonData] = useState<string>("");

  const handleNameChange = (index: number, value: string) => {
    const updatedList = [...nameList];
    updatedList[index] = value;
    setNameList(updatedList);
    setJsonData(exportToJson(selectedDate, updatedList));
  };

  const addNameField = () => {
    const updatedList = [...nameList, ""];
    setNameList(updatedList);
    setJsonData(exportToJson(selectedDate, updatedList));
  };

  const removeNameField = (index: number) => {
    const updatedList = nameList.filter((_, i) => i !== index);
    setNameList(updatedList);
    setJsonData(exportToJson(selectedDate, updatedList));
  };

  const exportToJson = (selectedDate: Date | null, nameList: string[]) => {
    return JSON.stringify({ selectedDate, nameList }, null, 2);
  };

  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.selectedDate && data.nameList) {
        const selectedDate = new Date(data.selectedDate);
        const currentDate = new Date();
        const weeksPassed = Math.floor(
          (currentDate.getTime() - selectedDate.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );

        let rotatedNameList = [...data.nameList];
        for (let i = 0; i < weeksPassed; i++) {
          const firstElement = rotatedNameList.shift();
          if (firstElement) {
            rotatedNameList.push(firstElement);
          }
        }

        const jsonDataMillis = selectedDate.getTime();
        selectedDate.setTime(
          jsonDataMillis + weeksPassed * 7 * 24 * 60 * 60 * 1000
        );

        setSelectedDate(selectedDate);
        setNameList(rotatedNameList);
        setJsonData(exportToJson(selectedDate, rotatedNameList));
      }
    } catch (error) {
      console.error("Invalid JSON data", error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Web Toban
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select a date"
            value={selectedDate}
            onChange={(newValue) => {
              setSelectedDate(newValue);
              setJsonData(exportToJson(newValue, nameList));
            }}
          />
        </LocalizationProvider>
        <Box sx={{ marginTop: 2, display: "flex", flexDirection: "column" }}>
          {nameList.map((name, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <TextField
                label={`Name ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                sx={{ marginRight: 2 }}
              />
              <Button onClick={() => removeNameField(index)}>Remove</Button>
            </Box>
          ))}
          <Button onClick={addNameField}>Add Name</Button>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <TextField
            label="Exported JSON"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            multiline
            rows={12}
            fullWidth
          />
          <Button sx={{ marginTop: 2 }} onClick={() => importData(jsonData)}>
            Import JSON
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default App;
