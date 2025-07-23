import React from 'react';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import { Box, Button, Checkbox, IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowsProp } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

type GridValue = Record<string, any>[];

export const EditableGridField = (props: FieldExtensionComponentProps<GridValue>) => {
  const [rows, setRows] = React.useState<GridRowsProp>(props.value ?? []);

  // Generate columns from schema
  const baseProperties = props.schema?.items?.properties ?? {};
  const schemaRequired = props.schema?.items?.required ?? [];

  const columns: GridColDef[] = React.useMemo(() => {
    const schemaColumns = Object.entries(baseProperties).map(([field, schema]) => {
      const isBoolean = schema.type === 'boolean';

      return {
        field,
        headerName: schema.title ?? field,
        editable: true,
        width: 200,
        flex: 1,
        type: isBoolean ? 'boolean' : 'string',
        renderCell: isBoolean
          ? (params: GridRenderCellParams) => (
            <Checkbox checked={Boolean(params.value)} disabled />
          )
          : undefined,
        renderEditCell: isBoolean
          ? (params: GridRenderEditCellParams) => {
            const { id, field, value, api } = params;
            return (
              <Checkbox
                checked={Boolean(value)}
                onChange={(event) => {
                  api.setEditCellValue({ id, field, value: event.target.checked });
                }}
                autoFocus
              />
            );
          }
          : undefined,
      } as GridColDef;
    });

    return [
      ...schemaColumns,
      {
        field: '__actions__',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 50,
        renderCell: (params) => (
          <IconButton
            onClick={() => {
              const updated = rows.filter((row) => row.id !== params.row.id);
              setRows(updated);
              props.onChange(updated);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ];
  }, [baseProperties, rows]);

  // Handle row edit
  const handleRowEdit = (newRow: any) => {
    const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
    setRows(updatedRows);
    props.onChange(updatedRows);
    return newRow;
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = { id: `${Date.now()}` };

    Object.entries(baseProperties).forEach(([key, schema]) => {
      if (schema.type === 'boolean') {
        newRow[key] = schema.default ?? false;
      } else {
        newRow[key] = schema.default ?? '';
      }
    });

    const updated = [...rows, newRow];
    setRows(updated);
    props.onChange(updated);
  };

  return (
    <Box>
      <Button variant="outlined" onClick={handleAddRow} sx={{ mb: 2 }}>
        Add Row
      </Button>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          processRowUpdate={handleRowEdit}
          hideFooter={true}
        />
      </div>
    </Box>
  );
};