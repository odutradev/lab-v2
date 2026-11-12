import { TbPlus, TbBolt } from "react-icons/tb";

import Button from "@components/button";
import PageHeader from "@components/pageHeader";

import useWorkoutsPage from "../../hook";

export const WorkoutsHeader = () => {
  const { todayKey, openRoutineForm, openSessionModal } = useWorkoutsPage();

  return (
    <PageHeader
      title="Treinos"
      description="Monte sua semana, marque se foi e acompanhe a constância."
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<TbBolt size={16} />}
            onClick={() => openSessionModal({ date: todayKey })}
          >
            Treino avulso
          </Button>
          <Button size="sm" leftIcon={<TbPlus size={16} />} onClick={() => openRoutineForm("new")}>
            Nova rotina
          </Button>
        </>
      }
    />
  );
};

export default WorkoutsHeader;
