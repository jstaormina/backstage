import React from 'react';
import {
  FieldExtensionComponentProps,
  FieldExtensionComponent,
} from '@backstage/plugin-scaffolder-react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';

type GridValue = Record<string, any>[];

export const EditableGridField: FieldExtensionComponent<GridValue> = (
  props: FieldExtensionComponentProps<GridValue>,
) => {
  const baseProperties = props.schema?.items?.properties ?? {};
  const schemaRequired = props.schema?.items?.required ?? [];

  const [rows, setRows] = React.useState<GridRowsProp>([]);

  // Sync rows from formData via props.value
  React.useEffect(() => {
    if (Array.isArray(props.value)) {
      const withIds = props.value.map((item, idx) => ({
        id: item.id ?? `${Date.now()}-${idx}`,
        ...item,
      }));
      setRows(withIds);
    }
  }, [props.value]);

  // Dynamic columns based on schema
  const columns: GridColDef[] = React.useMemo(() => {
    const schemaColumns = Object.entries(baseProperties).map(
      ([field, schema]) => {
        const isBoolean = schema.type === 'boolean';
        const isRequired = schemaRequired.includes(field);
        const title = (schema.title ?? field) + (isRequired ? ' *' : '');

        return {
          field,
          headerName: title,
          editable: true,
          flex: 1,
          minWidth: 150,
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
                      api.setEditCellValue({
                        id,
                        field,
                        value: event.target.checked,
                      });
                    }}
                    autoFocus
                  />
                );
              }
            : undefined,
        } as GridColDef;
      },
    );

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
              props.onChange(updated.map(({ id, ...rest }) => rest));
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ];
  }, [baseProperties, rows]);

  const handleRowEdit = (newRow: any) => {
    const updatedRows = rows.map((row) =>
      row.id === newRow.id ? newRow : row,
    );
    setRows(updatedRows);
    props.onChange(updatedRows.map(({ id, ...rest }) => rest));
    return newRow;
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {
      id: `${Date.now()}`,
    };

    Object.entries(baseProperties).forEach(([key, schema]) => {
      if (schema.type === 'boolean') {
        newRow[key] = schema.default ?? false;
      } else {
        newRow[key] = schema.default ?? '';
      }
    });

    const updated = [...rows, newRow];
    setRows(updated);
    props.onChange(updated.map(({ id, ...rest }) => rest));
  };

  return (
    <Box>
      {props.schema?.title && (
        <Typography variant="h6" gutterBottom>
          {props.schema.title}
        </Typography>
      )}

      <Button variant="outlined" onClick={handleAddRow} sx={{ mb: 2 }}>
        Add Row
      </Button>

      <div style={{ height: 400 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          processRowUpdate={handleRowEdit}
        />
      </div>
    </Box>
  );
};
