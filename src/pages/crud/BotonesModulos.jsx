import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import classNames from "classnames";
import {
	Column,
	Toast,
	Button,
	Dialog,
	InputText,
	Dropdown,
	InputTextarea,
	TabView,
	TabPanel,
	tabHeaderIIespanol,
	tabHeaderIIingles,
	EditorHtml,
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
import { ImagenCampo } from "../../components/crud/ImagenCampo";
// import { AdjuntoCampo } from "../../components/crud/AdjuntoCampo";

export const BotonesModulos = () => {
	const TABLA = "botonesaplicaciones";
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
	const [categoriasSeleccion, setcategoriasSeleccion] = useState(null);

	// console.log({grupo});

	useEffect(() => {
		//cargar la data total
		setCargando(true);
		dispatch(setFormData(emptyFormData));

		datatable.gettable(TABLA).then((data) => {
			dispatch(setDataSet(data));
			setCargando(false);
		});
	}, [recargar]);

	// useEffect(() => {
	// 	datatable
	// 		.gettable("parametros/categorias")
	// 		.then((categorias) => setcategoriasSeleccion(categorias));
	// }, []);

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
	const cambiohtml = (x, name) => {
		let _product = { ...formData };
		_product[`${name}`] = x;
		dispatch(setFormData(_product));
	};

	/*eventos*/

	/**operacion transacciones */
	const saveProduct = () => {
		setSubmitted(true);
		if (formData.tit_btn?.trim()) {
			// console.log(formData);
			// debugger
			setCargando(true);
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
					{/* <BarraSuperior openNew={openNew} /> */}
					<TablaDatos
						datostabla={dataSet}
						titulo='Botones por modulo'>
						<Column
							field='tit_btn'
							header='Nombre'
							sortable
							headerStyle={{
								width: "40%",
								minWidth: "10rem",
							}}></Column>

						<Column
							field='tip_btn'
							header='Modulo'
							sortable
							headerStyle={{
								width: "40%",
								minWidth: "10rem",
							}}></Column>
						<Column
							field='ord_btn'
							header='Orden'
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
						header='Detalle Botones'
						modal={true}
						className='p-fluid'
						footer={productDialogFooter(hideDialog, saveProduct)}
						onHide={hideDialog}>
						<TabView>
							<TabPanel className='justify-content: flex-end;'>
								<div className='field col'>
									<label htmlFor='tit_btn'>Nombre:</label>
									<InputText
										id='tit_btn'
										value={formData.tit_btn}
										onChange={(e) =>
											onInputChange(e, "tit_btn")
										}
										required
										autoFocus
										className={classNames({
											"p-invalid":
												submitted && !formData.tit_btn,
										})}
									/>
									{submitted && !formData.tit_btn && (
										<small className='p-invalid'>
											Campo requerido.
										</small>
									)}
								</div>
								<div className='formgrid grid'>
									<div className='field col-6'>
										<label htmlFor='lin_btn'>Ruta:</label>
										<InputText
											id='lin_btn'
											value={formData.lin_btn}
											onChange={(e) =>
												onInputChange(e, "lin_btn")
											}
										/>
									</div>

									<div className='field col-6'>
										<label htmlFor='ord_btn'>Orden:</label>
										<InputText
											id='ord_btn'
											value={formData.ord_btn}
											onChange={(e) =>
												onInputChange(e, "ord_btn")
											}
										/>
									</div>
								</div>
								<div className='field col-126'>
									<label htmlFor='sti_btn'>
										Descripcion:
									</label>
									<InputTextarea
										id='sti_btn'
										value={formData.sti_btn}
										onChange={(e) =>
											onInputChange(e, "sti_btn")
										}
										required
										rows={6}
										cols={20}
									/>
								</div>

								<div className='formgrid grid'>
									<div className='field col-12'>
										<ImagenCampo
											label='Imagen'
											formData={formData}
											CampoImagen='img_btn'
											nombreCampo='demo'
											edicampo={formData.img_btn}
											urlupload='/upload/files/botones_home'
										/>
									</div>
								</div>
							</TabPanel>
						</TabView>

						{/* </div> */}
					</Dialog>
					<EliminarVentana
						deleteProductDialog={deleteProductDialog}
						product={formData.tit_btn}
						hideDeleteProductDialog={hideDeleteProductDialog}
						deleteProduct={deleteProduct}
					/>
				</div>
			</div>
		</div>
	);
};
