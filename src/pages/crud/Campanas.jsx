import { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";

import classNames from "classnames";
import {
	Column,
	Toast,
	Button,
	Dialog,
	InputText,
	Calendar,
	Dropdown,
} from "../../components/crud";
import { Conexion } from "../../service/Conexion";
import {
	TablaDatos,
	BarraSuperior,
	EliminarVentana,
	productDialogFooter,
} from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { setDataSet, setFormData } from "../../store/appSlice";
import { Cargando } from "../../components/crud/Cargando";
// import { ImagenCampo } from "../../components/crud/ImagenCampo";

export const Campanas = () => {
	const TABLA = "campanias";
	let emptyFormData = {};
	const { dataSet, formData } = useSelector((state) => state.appsesion); //datos el storage redux
	const dispatch = useDispatch();
	const [productDialog, setProductDialog] = useState(false);
	const [deleteProductDialog, setDeleteProductDialog] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const toast = useRef(null);
	const [recargar, setrecargar] = useState(0);
	const [cargando, setCargando] = useState(false);
	const datatable = new Conexion();
	const [dropdownSINO, setdropdownSINO] = useState(null);
	const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);
	// const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);

	// console.log({grupo});

	useEffect(() => {
		//solo para que se ejecute una vez al inicio
		/** setting parametros dropdowns u otros objetos independientes */
		datatable.gettable("parametros/parametros/si_no").then((datos) => {
			setdropdownTipoAliado(datos);
		});

		/** setting parametros dropdowns u otros objetos independientes */
	}, []);

	useEffect(() => {
		//cargar la data total
		setCargando(true);
		dispatch(setFormData(emptyFormData));

		datatable.gettable(TABLA).then((data) => {
			dispatch(setDataSet(data));
			setCargando(false);
		});
	}, [recargar]);

	/*eventos*/
	const openNew = () => {
		dispatch(setFormData(emptyFormData));
		setSubmitted(false);
		setProductDialog(true);
	};
	const hideDialog = () => {
		setSubmitted(false);
		setProductDialog(false);
	};

	const hideDeleteProductDialog = () => {
		setDeleteProductDialog(false);
	};

	const editProduct = (id) => {
		setCargando(true);
		datatable
			.getItem(TABLA, id)
			.then((data) => dispatch(setFormData({ ...data.data })));
		setProductDialog(true);
		setCargando(false);
	};

	const confirmDeleteProduct = (fila) => {
		dispatch(setFormData(fila));
		setDeleteProductDialog(true);
	};
	const trasaccionExitosa = (tipo = "") => {
		setrecargar(recargar + 1);
		tipo === "borrar" ? setDeleteProductDialog(false) : hideDialog();
		dispatch(setFormData(emptyFormData));

		toast.current.show({
			severity: "success",
			summary: "Confirmacion",
			detail: "Transacción Exitosa",
			life: 4000,
		});
	};

	const onInputChangeDate = (e, name) => {
		const val = e.value.toISOString().split("T")[0] || "";
		let _product = { ...formData };
		_product[`${name}`] = val;
		dispatch(setFormData(_product));
	};

	/*eventos*/

	/**operacion transacciones */
	const saveProduct = () => {
		setSubmitted(true);
		if (formData.nom_cam?.trim()) {
			console.log(formData);
			// debugger
			// setCargando(true);
			if (formData.id == null) {
				//nuevo registro
				datatable
					.getCrearItem(TABLA, formData)
					.then((data) => trasaccionExitosa());
			} else {
				//editar registro
				datatable
					.getEditarItem(TABLA, formData, formData.id)
					.then((data) => trasaccionExitosa());
			}
		}
	};
	const deleteProduct = () =>
		datatable
			.getEliminarItem(TABLA, formData, formData.id)
			.then((data) => trasaccionExitosa("borrar"));
	/**operacion transacciones */

	/* validaciones de campos */
	const onInputChange = (e, name) => {
		// console.log(e.target, e.target.value, name);
		const val = (e.target && e.target.value) || "";
		let _product = { ...formData };
		_product[`${name}`] = val;

		// console.log(_product);
		dispatch(setFormData(_product));
	};

	const actionBodyTemplate = (rowData) => {
		return (
			<div
				className='actions'
				style={{
					display: "flex",
				}}>
				<Button
					icon='pi pi-pencil'
					className='p-button-rounded p-button-success mr-2'
					onClick={() => editProduct(rowData.id)}
				/>
				<Button
					icon='pi pi-trash'
					className='p-button-rounded p-button-warning mr-2'
					onClick={() => confirmDeleteProduct(rowData)}
				/>
			</div>
		);
	};

	return (
		<div className='grid'>
			<div className='col-12'>
				<div className='card'>
					<Cargando cargando={cargando} />
					<Toast ref={toast} />
					<BarraSuperior openNew={openNew} />
					<TablaDatos datostabla={dataSet} titulo='Campañas'>
						<Column
							field='nom_cam'
							header='Nombre'
							sortable
							headerStyle={{
								width: "40%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='ini_cam'
							header='Fecha'
							sortable
							headerStyle={{
								width: "40%",
								minWidth: "10rem",
							}}></Column>
						<Column
							header='Acciones'
							body={actionBodyTemplate}></Column>
					</TablaDatos>

					<Dialog
						visible={productDialog}
						style={{ width: "850px" }}
						header='Detalle Campaña'
						modal={true}
						className='p-fluid'
						footer={productDialogFooter(hideDialog, saveProduct)}
						onHide={hideDialog}>
						<div className='formgrid grid'>
							<div className='field col-6'>
								{/* <pre>{JSON.stringify(formData,2)}</pre> */}
								<label htmlFor='nom_cam'>Nombre</label>
								<InputText
									id='nom_cam'
									value={formData.nom_cam}
									onChange={(e) =>
										onInputChange(e, "nom_cam")
									}
									required
									autoFocus
									className={classNames({
										"p-invalid":
											submitted && !formData.nom_cam,
									})}
								/>
								{submitted && !formData.nom_cam && (
									<small className='p-invalid'>
										Campo requerido.
									</small>
								)}
							</div>
							<div className='field col-6'>
								<label htmlFor='ini_cam'>Fecha:</label>
								<Calendar
									id='basic'
									// value={new Date(formData.ini_cam)}
									value={
										new Date(formData.ini_cam + "T00:00:00")
									}
									onChange={(e) =>
										onInputChangeDate(e, "ini_cam")
									}
									// dateFormat='dd/mm/yy'
									dateFormat='yy-mm-dd'
								/>
							</div>
						</div>

						<div className='formgrid grid'>
							<div className='field col-6'>
								<label htmlFor='mat_cam'>Ruta dropbox:</label>
								<InputText
									id='mat_cam'
									value={formData.mat_cam}
									onChange={(e) =>
										onInputChange(e, "mat_cam")
									}
								/>
							</div>
							<div className='field col-6'>
								<label htmlFor='act_cam'>
									Activar Campaña:
								</label>
								<Dropdown
									value={formData.act_cam}
									onChange={(e) => {
										console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												act_cam: e.value,
											})
										);
									}}
									options={dropdownTipoAliado}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>

						<div className='formgrid grid'></div>
					</Dialog>
					<EliminarVentana
						deleteProductDialog={deleteProductDialog}
						product={formData.nom_cam}
						hideDeleteProductDialog={hideDeleteProductDialog}
						deleteProduct={deleteProduct}
					/>
				</div>
			</div>
		</div>
	);
};
