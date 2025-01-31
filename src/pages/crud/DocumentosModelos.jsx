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
import { AdjuntoCampo } from "../../components/crud/AdjuntoCampo";
// import { ImagenCampo } from "../../components/crud/ImagenCampo";

export const DocumentosModelos = () => {
	const TABLA = "documentocampama";
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
	const [dropdownTipoDocumentos, setdropdownTipoDocumentos] = useState(null);
	const [dropdownModelos, setdropdownModelos] = useState(null);
	// const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);
	// const [dropdownTipoAliado, setdropdownTipoAliado] = useState(null);

	// console.log({grupo});

	useEffect(() => {
		//solo para que se ejecute una vez al inicio
		/** setting parametros dropdowns u otros objetos independientes */
		datatable
			.gettable("parametros/parametros/tipodocumentocampana")
			.then((datos) => {
				setdropdownTipoDocumentos(datos);
			});
		datatable.gettable("parametros/modelos").then((datos) => {
			setdropdownModelos(datos);
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
		if (formData.cod_tip_doc?.trim()) {
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
					<TablaDatos
						datostabla={dataSet}
						titulo='Documentos Modelos'>
						<Column
							field='tipodocumento'
							header='Documento'
							sortable
							headerStyle={{
								width: "40%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='nombremodelo'
							header='Modelo'
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
						header='Detalle Documento Modelo'
						modal={true}
						className='p-fluid'
						footer={productDialogFooter(hideDialog, saveProduct)}
						onHide={hideDialog}>
						<div className='formgrid grid'>
							<div className='field col-6'>
								{/* <pre>{JSON.stringify(formData,2)}</pre> */}
								<label htmlFor='cod_tip_doc'>
									Tipo Documento
								</label>
								<Dropdown
									value={formData.cod_tip_doc}
									onChange={(e) => {
										console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												cod_tip_doc: e.value,
											})
										);
									}}
									options={dropdownTipoDocumentos}
									optionLabel='name'
									placeholder='Seleccione'
								/>
								{submitted && !formData.cod_tip_doc && (
									<small className='p-invalid'>
										Campo requerido.
									</small>
								)}
							</div>
							<div className='field col-6'>
								<label htmlFor='cod_cod_mod'>Modelo:</label>
								<Dropdown
									value={formData.cod_cod_mod}
									onChange={(e) => {
										console.log(e.value);
										dispatch(
											setFormData({
												...formData,
												cod_cod_mod: e.value,
											})
										);
									}}
									options={dropdownModelos}
									optionLabel='name'
									placeholder='Seleccione'
								/>
							</div>
						</div>

						<div className='formgrid grid'>
							<div className='field col-6'>
								{/* <label htmlFor='id_ciudad'>Ciudad:</label> */}
								<AdjuntoCampo
									label='Adjunto'
									formData={formData}
									CampoImagen='nom_doc'
									nombreCampo='demo'
									edicampo={formData.nom_doc}
									urlupload='/upload/files/pdf'
								/>
							</div>
						</div>
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
