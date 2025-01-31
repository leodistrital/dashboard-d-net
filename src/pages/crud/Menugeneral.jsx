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
	InputTextarea,
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

export const Menugeneral = () => {
	const TABLA = "menugeneral";
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
	const [dropdownCiudades, setdropdownCiudades] = useState(null);
	const [dropdownMenus, setdropdownMenus] = useState(null);
	const [dropdownModulos, serdropdownModulos] = useState(null);
	// const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);
	// const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);

	// console.log({grupo});

	useEffect(() => {
		//solo para que se ejecute una vez al inicio
		/** setting parametros dropdowns u otros objetos independientes */
		datatable.gettable("parametros/parametros/si_no").then((datos) => {
			setdropdownSINO(datos);
		});
		// datatable.gettable("parametros/ciudades").then((datos) => {
		// 	setdropdownCiudades(datos);
		// });
		datatable.gettable("parametros/menugeneral").then((datos) => {
			setdropdownMenus(datos);
		});
		datatable.gettable("parametros/modulos").then((datos) => {
			serdropdownModulos(datos);
		});

		/** setting parametros dropdowns u otros objetos independientes */
	}, []);

	useEffect(() => {
		//cargar la data total
		setCargando(true);
		dispatch(setFormData(emptyFormData));

		datatable.gettable(TABLA).then((data) => {
			dispatch(setDataSet(data));
			// console.log(data);
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
			.then((data) => 
			{	

				// console.log(data)
				dispatch(setFormData({ ...data }
					
				)
				
				
			)
		}
		);
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
		if (formData.nom_men?.trim()) {
			// console.log(formData);
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
					<TablaDatos datostabla={dataSet} titulo='Menu General'>
						<Column
							field='nom_men'
							header='Nombre'
							sortable
							headerStyle={{
								width: "30%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='menupadre'
							header='Menu'
							sortable
							headerStyle={{
								width: "20%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='ord_men'
							header='Orden'
							sortable
							headerStyle={{
								width: "20%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='activo'
							header='Activo'
							sortable
							headerStyle={{
								width: "20%",
								minWidth: "10rem",
							}}></Column>
						<Column
							header='Acciones'
							body={actionBodyTemplate}></Column>
					</TablaDatos>

					<Dialog
						visible={productDialog}
						style={{ width: "850px" }}
						header='Detalle Menu'
						modal={true}
						className='p-fluid'
						footer={productDialogFooter(hideDialog, saveProduct)}
						onHide={hideDialog}>
						<div className='formgrid grid'>
							<div className='field col-6'>
								{/* <pre>{JSON.stringify(formData,2)}</pre> */}
								<label htmlFor='nom_men'>Nombre</label>
								<InputText
									id='nom_men'
									value={formData.nom_men}
									onChange={(e) => onInputChange(e, "nom_men")}
									required
									autoFocus
									className={classNames({
										"p-invalid":
											submitted && !formData.nom_men,
									})}
								/>
								{submitted && !formData.nom_men && (
									<small className='p-invalid'>
										Campo requerido.
									</small>
								)}
							</div>
							<div className='field col-6'>
								<label htmlFor='pad_men'>Menu:</label>
								<Dropdown
									value={formData.pad_men}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												pad_men: e.value,
											})
										);
									}}
									options={dropdownMenus}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>

						<div className='formgrid grid'>
							<div className='field col-6'>
								<label htmlFor='des_men'>Activar:</label>
								<Dropdown
									value={formData.des_men}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												des_men: e.value,
											})
										);
									}}
									options={dropdownSINO}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
							<div className='field col-6'>
								<label htmlFor='cod_mod'>Modulo:</label>
								<Dropdown
									value={formData.cod_mod}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												cod_mod: e.value,
											})
										);
									}}
									options={dropdownModulos}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>

						<div className='formgrid grid'>
							<div className='field col-6'>
								<label htmlFor='rut_men'>Ruta:</label>
								<InputText
									id='rut_men'
									value={formData.rut_men}
									onChange={(e) =>
										onInputChange(e, "rut_men")
									}
								/>
							</div>
							<div className='field col-6'>
								<label htmlFor='ord_men'>Orden:</label>
								<InputText
									id='ord_men'
									value={formData.ord_men}
									onChange={(e) =>
										onInputChange(e, "ord_men")
									}
								/>
							</div>
						</div>

						<div className='formgrid grid'>
							<div className='field col-6'>
								<label htmlFor='ext_men'>Url Externa:</label>
								<Dropdown
									value={formData.ext_men}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												ext_men: e.value,
											})
										);
									}}
									options={dropdownSINO}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
							<div className='field col-6'>
								<label htmlFor='box_men'>Dropbox:</label>
								<Dropdown
									value={formData.box_men}
									onChange={(e) => {
										// console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												box_men: e.value,
											})
										);
									}}
									options={dropdownSINO}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>

						<div className='field col'>
							<label htmlFor='tit_men'>Titulo:</label>
							<InputTextarea
								id='tit_men'
								value={formData.tit_men}
								onChange={(e) =>
									onInputChange(e, "tit_men")
								}
								required
								rows={6}
								cols={20}
							/>
						</div>

						<div className='field col'>
							<label htmlFor='ent_men'>Descripcion:</label>
							<InputTextarea
								id='ent_men'
								value={formData.ent_men}
								onChange={(e) =>
									onInputChange(e, "ent_men")
								}
								required
								rows={6}
								cols={20}
							/>
						</div>



						<div className='formgrid grid'></div>
					</Dialog>
					<EliminarVentana
						deleteProductDialog={deleteProductDialog}
						product={formData.nombre}
						hideDeleteProductDialog={hideDeleteProductDialog}
						deleteProduct={deleteProduct}
					/>
				</div>
			</div>
		</div>
	);
};
