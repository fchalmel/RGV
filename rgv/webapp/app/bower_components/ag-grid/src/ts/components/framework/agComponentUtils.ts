import {Autowired, Bean} from "../../context/context";
import {AgGridComponentFunctionInput, AgGridRegisteredComponentInput} from "./componentProvider";
import {IComponent} from "../../interfaces/iComponent";
import {ComponentMetadata, ComponentMetadataProvider} from "./componentMetadataProvider";
import {ComponentSource, ComponentType, ResolvedComponent} from "./componentResolver";
import {ICellRendererComp, ICellRendererParams} from "../../rendering/cellRenderers/iCellRenderer";
import {_} from "../../utils";

@Bean("agComponentUtils")
export class AgComponentUtils {
    @Autowired("componentMetadataProvider")
    private componentMetadataProvider:ComponentMetadataProvider;

    public adaptFunction <A extends IComponent<any> & B, B>(
        propertyName:string,
        hardcodedJsFunction: AgGridComponentFunctionInput,
        type:ComponentType,
        source:ComponentSource
    ):ResolvedComponent<A,B>{
        if (hardcodedJsFunction == null) return {
            component: null,
            type: type,
            source: source
        };

        let metadata:ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter){
            return {
                type: type,
                component: <{new(): A}>metadata.functionAdapter(hardcodedJsFunction),
                source: source
            }
        }
        console.error(`It seems like you are providing a function as a component: ${hardcodedJsFunction}, but this component: [${propertyName}] doesnt accept functions`)
        return null;
    }

    public adaptCellRendererFunction (callback:AgGridComponentFunctionInput):{new(): IComponent<any>}{
        class Adapter implements ICellRendererComp{
            private params: ICellRendererParams;

            refresh(params: any): boolean {
                return false;
            }

            getGui(): HTMLElement {
                let callbackResult: string | HTMLElement = callback(this.params);
                if (typeof callbackResult != 'string') return callbackResult;

                return _.loadTemplate('<span>' + callbackResult + '</span>');
            }

            init?(params: ICellRendererParams): void {
                this.params = params;
            }

        }
        return Adapter;
    }


    public doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any>>): boolean {
        if (!candidate) return false;
        return (<any>candidate).prototype && 'getGui' in (<any>candidate).prototype;
    }
}